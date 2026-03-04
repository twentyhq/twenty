import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

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
import { extractTarballSecurely } from 'src/engine/core-modules/application/utils/extract-tarball-securely.util';
import { resolvePackageContentDir } from 'src/engine/core-modules/application/utils/tarball-utils';
import { readJsonFile } from 'src/engine/core-modules/application/utils/read-json-file.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';

@Injectable()
export class AppTarballUploadService {
  private readonly logger = new Logger(AppTarballUploadService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async uploadTarball(params: {
    tarballBuffer: Buffer;
    universalIdentifier?: string;
    workspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    const tempDir = join(tmpdir(), 'twenty-tarball-upload', v4());

    await fs.mkdir(tempDir, { recursive: true });

    try {
      const tarballPath = join(tempDir, 'app.tar.gz');

      await fs.writeFile(tarballPath, params.tarballBuffer);

      const extractDir = join(tempDir, 'extracted');

      await fs.mkdir(extractDir, { recursive: true });
      await extractTarballSecurely(tarballPath, extractDir);

      const contentDir = await resolvePackageContentDir(extractDir);

      const manifest = await readJsonFile<{
        application?: {
          universalIdentifier?: string;
          displayName?: string;
        };
      }>(contentDir, 'manifest.json');

      const universalIdentifier =
        params.universalIdentifier ??
        manifest.application?.universalIdentifier;

      if (!isDefined(universalIdentifier)) {
        throw new ApplicationException(
          'universalIdentifier is required (in body or manifest)',
          ApplicationExceptionCode.INVALID_INPUT,
        );
      }

      let appRegistration = await this.appRegistrationRepository.findOne({
        where: {
          universalIdentifier,
          workspaceId: params.workspaceId,
        },
      });

      if (isDefined(appRegistration)) {
        if (
          appRegistration.sourceType !== AppRegistrationSourceType.LOCAL &&
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
          sourceType: AppRegistrationSourceType.TARBALL,
          oAuthClientId: v4(),
          oAuthRedirectUris: [],
          oAuthScopes: [],
          workspaceId: params.workspaceId,
        });

        appRegistration =
          await this.appRegistrationRepository.save(appRegistration);
      }

      const packageJson = await readJsonFile<{ version?: string }>(
        contentDir,
        'package.json',
      ).catch(() => null);

      const storagePath = join('app-tarball', appRegistration.id);

      await this.fileStorageService.writeFileLegacy({
        file: params.tarballBuffer,
        name: 'app.tar.gz',
        folder: storagePath,
        mimeType: 'application/gzip',
      });

      await this.appRegistrationRepository.update(appRegistration.id, {
        sourceType: AppRegistrationSourceType.TARBALL,
        ...(isDefined(packageJson?.version)
          ? { latestAvailableVersion: packageJson.version }
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
}
