import { Injectable, Logger } from '@nestjs/common';

import axios from 'axios';

import { ApplicationPackageFetcherService } from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { assertValidNpmPackageName } from 'src/engine/core-modules/application/application-package/utils/assert-valid-npm-package-name.util';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

type NpmPackument = {
  name: string;
  'dist-tags': Record<string, string>;
  maintainers: Array<{ name: string; email: string }>;
  versions: Record<string, { dist?: { tarball?: string; integrity?: string } }>;
};

export type ProvenanceMetadata = {
  repositoryUrl: string | null;
  hasProvenance: boolean;
};

@Injectable()
export class ApplicationNpmRegistrationService {
  private readonly logger = new Logger(ApplicationNpmRegistrationService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly applicationPackageFetcherService: ApplicationPackageFetcherService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
  ) {}

  async fetchPackument(packageName: string): Promise<NpmPackument> {
    const registryUrl = this.twentyConfigService.get('APP_REGISTRY_URL');

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'Twenty-NpmRegistration',
    };

    const authToken = this.twentyConfigService.get('APP_REGISTRY_TOKEN');

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const { data } = await axios.get<NpmPackument>(
      `${registryUrl}/${encodeURIComponent(packageName).replaceAll('%40', '@')}`,
      { headers, timeout: 15_000 },
    );

    return data;
  }

  async fetchProvenanceMetadata(
    packageName: string,
    version: string,
  ): Promise<ProvenanceMetadata | null> {
    const registryUrl = this.twentyConfigService.get('APP_REGISTRY_URL');

    try {
      const { data } = await axios.get(
        `${registryUrl}/-/npm/v1/attestations/${encodeURIComponent(packageName)}@${version}`,
        {
          headers: { 'User-Agent': 'Twenty-Provenance' },
          timeout: 10_000,
        },
      );

      const repositoryUrl = this.extractRepositoryUrl(data);

      return { repositoryUrl, hasProvenance: true };
    } catch {
      return null;
    }
  }

  async registerNpmPackage(
    packageName: string,
    user: UserEntity,
    workspaceId: string,
  ): Promise<ApplicationRegistrationEntity> {
    if (!user.isEmailVerified) {
      throw new ApplicationRegistrationException(
        'Email must be verified to register npm packages',
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    assertValidNpmPackageName(packageName);

    const packument = await this.fetchPackument(packageName);

    const userEmailLower = user.email.toLowerCase();
    const isMaintainer = packument.maintainers.some(
      (maintainer) => maintainer.email.toLowerCase() === userEmailLower,
    );

    if (!isMaintainer) {
      throw new ApplicationRegistrationException(
        `Your verified email (${user.email}) is not listed as a maintainer of ${packageName}`,
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    const latestVersion = packument['dist-tags']?.latest;

    let provenanceMetadata: ProvenanceMetadata | null = null;

    if (latestVersion) {
      provenanceMetadata = await this.fetchProvenanceMetadata(
        packageName,
        latestVersion,
      );
    }

    const resolved =
      await this.applicationPackageFetcherService.resolveNpmPackage(
        packageName,
      );

    try {
      const { manifest } = resolved;

      return await this.applicationRegistrationService.upsertFromNpmRegistration(
        {
          universalIdentifier: manifest.application.universalIdentifier,
          packageName,
          name: manifest.application.displayName,
          description: manifest.application.description ?? null,
          author: manifest.application.author ?? null,
          ownerWorkspaceId: workspaceId,
          createdByUserId: user.id,
          latestAvailableVersion: latestVersion ?? null,
          isProvenanceVerified: provenanceMetadata?.hasProvenance ?? false,
          provenanceRepositoryUrl: provenanceMetadata?.repositoryUrl ?? null,
          provenanceVerifiedAt: provenanceMetadata?.hasProvenance
            ? new Date()
            : null,
        },
      );
    } finally {
      await this.applicationPackageFetcherService.cleanupExtractedDir(
        resolved.cleanupDir,
      );
    }
  }

  private extractRepositoryUrl(attestationData: unknown): string | null {
    try {
      const data = attestationData as {
        attestations?: Array<{
          predicateType?: string;
          bundle?: {
            dsseEnvelope?: {
              payload?: string;
            };
          };
        }>;
      };

      if (!data?.attestations?.length) {
        return null;
      }

      for (const attestation of data.attestations) {
        if (attestation.predicateType !== 'https://slsa.dev/provenance/v1') {
          continue;
        }

        const payload = attestation.bundle?.dsseEnvelope?.payload;

        if (!payload) {
          continue;
        }

        const decoded = JSON.parse(
          Buffer.from(payload, 'base64').toString('utf-8'),
        );

        const resolvedDependencies =
          decoded?.predicate?.buildDefinition?.resolvedDependencies;

        if (Array.isArray(resolvedDependencies)) {
          for (const dep of resolvedDependencies) {
            if (
              typeof dep.uri === 'string' &&
              dep.uri.startsWith('git+https://')
            ) {
              return dep.uri.replace(/^git\+/, '').replace(/@[^@]+$/, '');
            }
          }
        }
      }

      return null;
    } catch (error) {
      this.logger.warn(
        `Failed to extract repository URL from attestation: ${error}`,
      );

      return null;
    }
  }
}
