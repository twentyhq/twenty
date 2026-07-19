import { Injectable } from '@nestjs/common';

import semver from 'semver';
import * as z from 'zod';

import { type VersionInfoDTO } from 'src/engine/core-modules/admin-panel/dtos/version-info.dto';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class AdminPanelVersionService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async getVersionInfo(): Promise<VersionInfoDTO> {
    const currentVersion = this.twentyConfigService.get('APP_VERSION');

    try {
      const httpClient = this.secureHttpClientService.getHttpClient();

      const rawResponse = await httpClient.get<unknown>(
        'https://hub.docker.com/v2/repositories/twentycrm/twenty/tags?page_size=100',
      );
      const response = z
        .object({
          data: z.object({
            results: z.array(z.object({ name: z.string() })),
          }),
        })
        .parse(rawResponse);

      // Prefer full x.y.z tags (docker publishes v-prefixed tags like v2.22.0).
      // semver.clean accepts an optional leading "v"; floating tags (latest, v2,
      // v2.22) clean to null and are excluded.
      const versions = response.data.results
        .map((tag) => semver.clean(tag.name))
        .filter((name): name is string => name !== null);

      if (versions.length === 0) {
        return { currentVersion, latestVersion: null };
      }

      versions.sort((a, b) => semver.rcompare(a, b));
      const latestVersion = versions[0];

      return { currentVersion, latestVersion };
    } catch {
      return { currentVersion, latestVersion: null };
    }
  }
}
