import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  ApplicationRegistrationEntity,
  AppRegistrationSourceType,
} from 'src/engine/core-modules/application-registration/application-registration.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationRestApiExceptionFilter } from 'src/engine/core-modules/application/application-rest-api-exception-filter';
import { extractTarballSecurely } from 'src/engine/core-modules/application/utils/extract-tarball-securely.util';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;

type TarballUploadBody = {
  tarball: string;
  universalIdentifier?: string;
};

@Controller('api/app-registrations')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(ApplicationRestApiExceptionFilter)
export class AppRegistrationUploadController {
  private readonly logger = new Logger(AppRegistrationUploadController.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Post('upload-tarball')
  @HttpCode(200)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.MARKETPLACE_APPS))
  async uploadTarball(
    @Body() body: TarballUploadBody,
    @Req() req: Request & { workspace?: { id: string } },
  ): Promise<ApplicationRegistrationEntity> {
    const workspaceId = req.workspace?.id;

    if (!isDefined(workspaceId)) {
      throw new ApplicationException(
        'Workspace context required',
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    const tarballBase64 = body.tarball;

    if (!isDefined(tarballBase64)) {
      throw new ApplicationException(
        'Tarball data is required',
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    const tarballBuffer = Buffer.from(tarballBase64, 'base64');

    if (tarballBuffer.length > MAX_UPLOAD_SIZE_BYTES) {
      throw new ApplicationException(
        `Tarball exceeds maximum size of ${MAX_UPLOAD_SIZE_BYTES} bytes`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    const tempDir = join(tmpdir(), 'twenty-tarball-upload', v4());

    await fs.mkdir(tempDir, { recursive: true });

    try {
      const tarballPath = join(tempDir, 'app.tar.gz');

      await fs.writeFile(tarballPath, tarballBuffer);

      const manifestPath = await this.extractAndValidate(tarballPath, tempDir);
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      const universalIdentifier =
        body.universalIdentifier ?? manifest.application?.universalIdentifier;

      if (!isDefined(universalIdentifier)) {
        throw new ApplicationException(
          'universalIdentifier is required (in body or manifest)',
          ApplicationExceptionCode.INVALID_INPUT,
        );
      }

      let appRegistration = await this.appRegistrationRepository.findOne({
        where: {
          universalIdentifier,
          workspaceId,
        },
      });

      if (isDefined(appRegistration)) {
        if (
          appRegistration.sourceType !== AppRegistrationSourceType.NONE &&
          appRegistration.sourceType !== AppRegistrationSourceType.TARBALL
        ) {
          throw new ApplicationException(
            `This app is registered as ${appRegistration.sourceType}. Cannot upload tarball.`,
            ApplicationExceptionCode.SOURCE_CHANNEL_MISMATCH,
          );
        }
      } else {
        appRegistration = this.appRegistrationRepository.create({
          universalIdentifier,
          name: manifest.application?.displayName ?? 'Unknown App',
          sourceType: AppRegistrationSourceType.NONE,
          oAuthClientId: v4(),
          oAuthRedirectUris: [],
          oAuthScopes: [],
          workspaceId,
        });

        appRegistration =
          await this.appRegistrationRepository.save(appRegistration);
      }

      const tarballVersion = await this.readPackageVersion(
        join(tempDir, 'extracted'),
      );

      const storagePath = join('app-tarball', appRegistration.id);

      await this.fileStorageService.writeFileLegacy({
        file: tarballBuffer,
        name: 'app.tar.gz',
        folder: storagePath,
        mimeType: 'application/gzip',
      });

      await this.appRegistrationRepository.update(appRegistration.id, {
        sourceType: AppRegistrationSourceType.TARBALL,
        ...(isDefined(tarballVersion)
          ? { latestAvailableVersion: tarballVersion }
          : {}),
      });

      this.logger.log(
        `Tarball uploaded for app ${universalIdentifier} (registration ${appRegistration.id})`,
      );

      return this.appRegistrationRepository.findOneOrFail({
        where: { id: appRegistration.id },
      });
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  private async extractAndValidate(
    tarballPath: string,
    tempDir: string,
  ): Promise<string> {
    const extractDir = join(tempDir, 'extracted');

    await fs.mkdir(extractDir, { recursive: true });
    await extractTarballSecurely(tarballPath, extractDir);

    return this.findManifestPath(extractDir);
  }

  private async readPackageVersion(
    extractDir: string,
  ): Promise<string | null> {
    const candidates = [
      join(extractDir, 'package.json'),
      join(extractDir, 'package', 'package.json'),
    ];

    for (const candidate of candidates) {
      try {
        const content = await fs.readFile(candidate, 'utf-8');
        const parsed = JSON.parse(content) as { version?: string };

        return parsed.version ?? null;
      } catch {
        continue;
      }
    }

    return null;
  }

  private async findManifestPath(extractDir: string): Promise<string> {
    const candidates = [
      join(extractDir, 'manifest.json'),
      join(extractDir, 'package', 'manifest.json'),
    ];

    for (const candidate of candidates) {
      try {
        await fs.access(candidate);

        return candidate;
      } catch {
        continue;
      }
    }

    throw new ApplicationException(
      'Tarball must contain manifest.json',
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }
}
