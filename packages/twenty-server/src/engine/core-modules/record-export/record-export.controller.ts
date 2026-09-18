import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';
import {
  Controller,
  ConflictException,
  ForbiddenException,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  UseFilters,
} from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { pipeline } from 'node:stream/promises';
import { Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { type FileTokenJwtPayload } from 'src/engine/core-modules/auth/types/file-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { RecordExportQueryWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';

@Controller('record-exports')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
@UseFilters(PermissionsRestApiExceptionFilter)
export class RecordExportController {
  constructor(
    private readonly recordExportCacheService: RecordExportCacheService,
    private readonly recordExportWorkspaceService: RecordExportWorkspaceService,
    private readonly recordExportQueryWorkspaceService: RecordExportQueryWorkspaceService,
    private readonly fileStorageService: FileStorageService,
    private readonly jwtWrapperService: JwtWrapperService,
  ) {}

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Query('token') token: string,
    @Res() response: Response,
  ): Promise<void> {
    let payload: FileTokenJwtPayload;
    try {
      payload = await this.jwtWrapperService.verifyJwtToken(token);
      if (
        payload.type !== JwtTokenTypeEnum.FILE ||
        payload.fileId !== id ||
        !isDefined(payload.workspaceId)
      ) {
        throw new ForbiddenException(
          t`Invalid or expired export download link.`,
        );
      }
    } catch {
      throw new ForbiddenException(t`Invalid or expired export download link.`);
    }

    const recordExport = await this.recordExportWorkspaceService.findOrThrow({
      workspaceId: payload.workspaceId,
      id,
    });
    this.recordExportWorkspaceService.assertDownloadable(recordExport);
    const requester =
      await this.recordExportQueryWorkspaceService.resolveRequester(
        recordExport,
      );
    const context = await this.recordExportQueryWorkspaceService.buildContext({
      parameters: recordExport.parameters,
      authContext: requester,
    });
    await this.recordExportQueryWorkspaceService.readPage({
      parameters: recordExport.parameters,
      context,
      first: 0,
    });

    const claimed =
      await this.recordExportCacheService.claimDownload(recordExport);
    if (!claimed) {
      throw new ConflictException(
        t`This export download has already started or expired.`,
      );
    }

    const resource = this.recordExportWorkspaceService.getFileResource({
      workspaceId: recordExport.workspaceId,
      resourcePath: `${recordExport.id}/${recordExport.fileId}.csv`,
    });
    response.setHeader('Cache-Control', 'private, no-store');
    const contentDisposition = `attachment; filename="${recordExport.filename.replace(/["\r\n\\]/g, '_')}"`;
    try {
      const stream = await this.fileStorageService.readFile(resource);
      response.setHeader('Content-Type', 'text/csv; charset=utf-8');
      response.setHeader('Content-Disposition', contentDisposition);
      await pipeline(stream, response);
    } finally {
      await this.recordExportWorkspaceService.cancel({
        workspaceId: recordExport.workspaceId,
        id: recordExport.id,
      });
    }
  }
}
