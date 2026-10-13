import {
  Controller,
  Get,
  Param,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { type Response } from 'express';

import { ApplicationRegistrationVersionArtifactService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version-artifact.service';
import {
  APPLICATION_REGISTRATION_VERSION_ARTIFACT_ROUTE,
  APPLICATION_REGISTRATION_VERSIONS_FILES_PATH,
} from 'src/engine/core-modules/application/application-registration-version/constants/application-registration-version-artifact-route.constant';
import { ApplicationRegistrationVersionArtifactGuard } from 'src/engine/core-modules/application/application-registration-version/guards/application-registration-version-artifact.guard';
import { ApplicationRestApiExceptionFilter } from 'src/engine/core-modules/application/application-rest-api-exception.filter';
import { PRESIGNED_URL_NO_STORE_CACHE_CONTROL } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@Controller(APPLICATION_REGISTRATION_VERSIONS_FILES_PATH)
@UseFilters(ApplicationRestApiExceptionFilter)
export class ApplicationRegistrationVersionArtifactController {
  constructor(
    private readonly applicationRegistrationVersionArtifactService: ApplicationRegistrationVersionArtifactService,
  ) {}

  @Get(
    `:applicationRegistrationVersionId/${APPLICATION_REGISTRATION_VERSION_ARTIFACT_ROUTE}`,
  )
  @UseGuards(ApplicationRegistrationVersionArtifactGuard, NoPermissionGuard)
  async downloadArtifact(
    @Param('applicationRegistrationVersionId')
    applicationRegistrationVersionId: string,
    @Res() response: Response,
  ): Promise<void> {
    const { buffer, fileName } =
      await this.applicationRegistrationVersionArtifactService.downloadRegistryArtifact(
        applicationRegistrationVersionId,
      );

    response.attachment(fileName);
    response.setHeader('Content-Type', 'application/gzip');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', PRESIGNED_URL_NO_STORE_CACHE_CONTROL);
    response.send(buffer);
  }
}
