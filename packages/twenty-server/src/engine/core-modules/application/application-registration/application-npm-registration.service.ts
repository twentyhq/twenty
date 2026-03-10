import { Injectable, Logger } from '@nestjs/common';

import axios from 'axios';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type ProvenanceMetadata = {
  repositoryUrl: string | null;
  hasProvenance: boolean;
};

@Injectable()
export class ApplicationNpmRegistrationService {
  private readonly logger = new Logger(ApplicationNpmRegistrationService.name);

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

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
