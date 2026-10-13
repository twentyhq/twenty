import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isAxiosError } from 'axios';
import bytes from 'bytes';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { buildRegistryRequestHeaders } from 'src/engine/core-modules/application/application-package/utils/build-registry-request-headers.util';
import { ApplicationRegistrationVersionEntity } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.entity';
import {
  APPLICATION_REGISTRATION_VERSION_ARTIFACT_ROUTE,
  APPLICATION_REGISTRATION_VERSIONS_FILES_PATH,
} from 'src/engine/core-modules/application/application-registration-version/constants/application-registration-version-artifact-route.constant';
import { compareSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compare-sri-integrity.util';
import { computeSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type ApplicationRegistrationVersionArtifactTokenJwtPayload } from 'src/engine/core-modules/auth/types/application-registration-version-artifact-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { MAX_REQUEST_BODY_SIZE } from 'src/engine/constants/max-request-body-size.constant';

const ARTIFACT_DOWNLOAD_TIMEOUT_MS = 30_000;

export type DownloadedRegistryArtifact = {
  buffer: Buffer;
  fileName: string;
};

@Injectable()
export class ApplicationRegistrationVersionArtifactService {
  private readonly logger = new Logger(
    ApplicationRegistrationVersionArtifactService.name,
  );

  constructor(
    @InjectRepository(ApplicationRegistrationVersionEntity)
    private readonly applicationRegistrationVersionRepository: Repository<ApplicationRegistrationVersionEntity>,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async signRegistryArtifactDownloadUrl(
    applicationRegistrationVersionId: string,
  ): Promise<string> {
    const payload: ApplicationRegistrationVersionArtifactTokenJwtPayload = {
      sub: applicationRegistrationVersionId,
      type: JwtTokenTypeEnum.APPLICATION_REGISTRATION_VERSION_ARTIFACT,
      applicationRegistrationVersionId,
    };

    const token = await this.jwtWrapperService.signAsyncOrThrow(payload, {
      expiresIn: this.twentyConfigService.get('FILE_TOKEN_EXPIRES_IN'),
    });

    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return `${serverUrl}/${APPLICATION_REGISTRATION_VERSIONS_FILES_PATH}/${applicationRegistrationVersionId}/${APPLICATION_REGISTRATION_VERSION_ARTIFACT_ROUTE}?token=${token}`;
  }

  async downloadRegistryArtifact(
    applicationRegistrationVersionId: string,
  ): Promise<DownloadedRegistryArtifact> {
    const version = await this.applicationRegistrationVersionRepository.findOne(
      { where: { id: applicationRegistrationVersionId } },
    );

    if (
      !isDefined(version) ||
      version.sourceType !== ApplicationRegistrationSourceType.NPM ||
      !isDefined(version.artifactUrl)
    ) {
      throw new ApplicationException(
        `No registry artifact is recorded for application registration version ${applicationRegistrationVersionId}`,
        ApplicationExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    const headers = buildRegistryRequestHeaders({
      url: version.artifactUrl,
      registryUrl: this.twentyConfigService.get('APP_REGISTRY_URL'),
      authToken: this.twentyConfigService.get('APP_REGISTRY_TOKEN'),
    });

    const buffer = await this.fetchArtifactBuffer({
      artifactUrl: version.artifactUrl,
      headers,
      version,
    });

    this.assertArtifactMatchesRecordedChecksum({ version, buffer });

    const unscopedPackageName = version.sourcePackage?.split('/').pop();

    return {
      buffer,
      fileName: `${unscopedPackageName ?? 'application'}-${version.version}.tgz`,
    };
  }

  private async fetchArtifactBuffer({
    artifactUrl,
    headers,
    version,
  }: {
    artifactUrl: string;
    headers: Record<string, string>;
    version: Pick<
      ApplicationRegistrationVersionEntity,
      'version' | 'applicationRegistrationId'
    >;
  }): Promise<Buffer> {
    const httpClient = this.secureHttpClientService.getHttpClient({
      timeout: ARTIFACT_DOWNLOAD_TIMEOUT_MS,
      maxContentLength: bytes(MAX_REQUEST_BODY_SIZE) ?? undefined,
    });

    try {
      const response = await httpClient.get(artifactUrl, {
        headers,
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data);
    } catch (error) {
      throw new ApplicationException(
        `Registry returned ${isAxiosError(error) ? error.response?.status : error} for the artifact of version ${version.version} of registration ${version.applicationRegistrationId}`,
        ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
      );
    }
  }

  private assertArtifactMatchesRecordedChecksum({
    version,
    buffer,
  }: {
    version: Pick<
      ApplicationRegistrationVersionEntity,
      'id' | 'version' | 'checksum'
    >;
    buffer: Buffer;
  }): void {
    if (!isDefined(version.checksum)) {
      return;
    }

    const comparison = compareSriIntegrity({
      expected: version.checksum,
      actual: computeSriIntegrity(buffer),
    });

    if (comparison === 'mismatch') {
      throw new ApplicationException(
        `Artifact served for version ${version.version} (${version.id}) does not match its recorded fingerprint`,
        ApplicationExceptionCode.PACKAGE_INTEGRITY_MISMATCH,
      );
    }

    if (comparison === 'incomparable') {
      this.logger.warn(
        `Fingerprint recorded for version ${version.version} (${version.id}) uses an algorithm this server cannot verify`,
      );
    }
  }
}
