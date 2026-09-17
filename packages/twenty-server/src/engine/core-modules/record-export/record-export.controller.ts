import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';
import {
  Controller,
  ConflictException,
  ForbiddenException,
  Get,
  Logger,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  UseFilters,
} from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { pipeline } from 'node:stream/promises';
import { type Request, Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { type RecordExportDownloadTokenJwtPayload } from 'src/engine/core-modules/record-export/types/record-export-download-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { RecordExportQueryWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { RecordExportSecurityService } from 'src/engine/core-modules/record-export/services/record-export-security.service';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';

@Controller('record-exports')
@UseGuards(
  JwtAuthGuard,
  WorkspaceAuthGuard,
  UserAuthGuard,
  CustomPermissionGuard,
)
@UseFilters(PermissionsRestApiExceptionFilter)
export class RecordExportController {
  private readonly logger = new Logger(RecordExportController.name);

  constructor(
    private readonly recordExportCacheService: RecordExportCacheService,
    private readonly recordExportSecurityService: RecordExportSecurityService,
    private readonly recordExportWorkspaceService: RecordExportWorkspaceService,
    private readonly recordExportQueryWorkspaceService: RecordExportQueryWorkspaceService,
    private readonly fileStorageService: FileStorageService,
    private readonly jwtWrapperService: JwtWrapperService,
  ) {}

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Query('token') token: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    let payload: RecordExportDownloadTokenJwtPayload;
    try {
      payload = await this.jwtWrapperService.verifyJwtToken(token);
      if (
        payload.type !== JwtTokenTypeEnum.FILE ||
        payload.purpose !== 'record-export' ||
        payload.fileId !== id ||
        !isDefined(payload.workspaceId) ||
        payload.workspaceId !== request.workspace?.id ||
        payload.userWorkspaceId !== request.userWorkspaceId
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
    this.recordExportSecurityService.assertDownloader({
      request,
      recordExport,
    });
    this.recordExportWorkspaceService.assertDownloadable(recordExport);
    try {
      await this.recordExportSecurityService.assertPermissionsUnchanged(
        recordExport,
      );
      const requester =
        await this.recordExportQueryWorkspaceService.resolveRequester(
          recordExport,
        );
      const context = await this.recordExportQueryWorkspaceService.buildContext(
        {
          parameters: recordExport.parameters,
          authContext: requester,
        },
      );
      await this.recordExportQueryWorkspaceService.readPage({
        parameters: recordExport.parameters,
        context,
        first: 0,
      });
    } catch (error) {
      await this.recordExportWorkspaceService
        .cancel(recordExport)
        .catch(() =>
          this.logger.warn(`Failed to remove export ${recordExport.id}`),
        );
      throw error;
    }

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
      try {
        await this.recordExportSecurityService.assertPermissionsUnchanged(
          recordExport,
        );
        response.setHeader('Content-Type', 'text/csv; charset=utf-8');
        response.setHeader('Content-Disposition', contentDisposition);
        await pipeline(stream, response);
      } finally {
        stream.destroy();
      }
    } finally {
      await this.recordExportWorkspaceService
        .cancel(recordExport)
        .catch(() =>
          this.logger.warn(`Failed to remove export ${recordExport.id}`),
        );
    }
  }
}
