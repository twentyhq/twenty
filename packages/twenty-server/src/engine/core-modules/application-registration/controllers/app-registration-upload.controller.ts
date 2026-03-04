import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationRestApiExceptionFilter } from 'src/engine/core-modules/application/application-rest-api-exception-filter';
import {
  AppTarballUploadService,
  MAX_TARBALL_UPLOAD_SIZE_BYTES,
} from 'src/engine/core-modules/application-registration/services/app-tarball-upload.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

type TarballUploadBody = {
  tarball: string;
  universalIdentifier?: string;
};

@Controller('api/app-registrations')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(ApplicationRestApiExceptionFilter)
export class AppRegistrationUploadController {
  constructor(
    private readonly appTarballUploadService: AppTarballUploadService,
  ) {}

  @Post('upload-tarball')
  @HttpCode(200)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.MARKETPLACE_APPS))
  async uploadTarball(
    @Body() body: TarballUploadBody,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationRegistrationEntity> {
    const tarballBase64 = body.tarball;

    if (!isDefined(tarballBase64)) {
      throw new ApplicationException(
        'Tarball data is required',
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    const tarballBuffer = Buffer.from(tarballBase64, 'base64');

    if (tarballBuffer.length > MAX_TARBALL_UPLOAD_SIZE_BYTES) {
      throw new ApplicationException(
        `Tarball exceeds maximum size of ${MAX_TARBALL_UPLOAD_SIZE_BYTES} bytes`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    return this.appTarballUploadService.uploadTarball({
      tarballBuffer,
      universalIdentifier: body.universalIdentifier,
      workspaceId,
    });
  }
}
