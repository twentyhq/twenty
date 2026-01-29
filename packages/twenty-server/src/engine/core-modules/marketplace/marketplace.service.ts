import { Injectable, Logger } from '@nestjs/common';

// eslint-disable-next-line no-restricted-imports
import { lowerCase, upperFirst } from 'lodash';
import { type ApplicationManifest } from 'twenty-shared/application';

import { type MarketplaceAppDTO } from './dtos/marketplace-app.dto';

type GitHubContent = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
};

const GITHUB_RAW_BASE_URL =
  'https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-apps';
const GITHUB_API_BASE_URL =
  'https://api.github.com/repos/twentyhq/twenty/contents/packages/twenty-apps';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  async findAllMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
    const apps: MarketplaceAppDTO[] = [];

    try {
      const appDirs = await this.getAppDirectoriesFromGitHub();

      for (const appDir of appDirs) {
        try {
          const manifest = await this.loadAppManifestFromGithub(appDir);

          if (manifest) {
            apps.push(manifest);
          } else {
            // to remove after manifest are committed to the repo
            const appName = appDir.replace(/^community\//, '');
            const appLabel = upperFirst(lowerCase(appName));

            apps.push({
              id: appName,
              name: appLabel,
              description: '',
              icon: '',
              version: '',
              author: 'Anonymous',
              category: '',
              logo: undefined,
              screenshots: [],
              aboutDescription: '',
              providers: [],
              websiteUrl: '',
              termsUrl: '',
            });
          }
        } catch (error) {
          this.logger.warn(
            `Failed to load manifest from ${appDir}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch marketplace apps from GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return apps;
  }

  private async getAppDirectoriesFromGitHub(): Promise<string[]> {
    const directories: string[] = [];

    const rootContents = await this.fetchGitHubDirectory('');

    for (const entry of rootContents) {
      // if (entry.type !== 'dir') continue;
      // if (entry.name.startsWith('.')) continue;
      // if (entry.name === 'node_modules') continue;
      // if (entry.name === 'internal') continue;

      if (entry.name === 'community') {
        const communityContents = await this.fetchGitHubDirectory('community');

        for (const communityEntry of communityContents) {
          if (communityEntry.type !== 'dir') continue;
          if (communityEntry.name.startsWith('.')) continue;

          directories.push(`community/${communityEntry.name}`);
        }
      }
    }

    return directories;
  }

  private async fetchGitHubDirectory(path: string): Promise<GitHubContent[]> {
    const url = path ? `${GITHUB_API_BASE_URL}/${path}` : GITHUB_API_BASE_URL;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Twenty-Marketplace',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  private async fetchGitHubFile(path: string): Promise<string | null> {
    const url = `${GITHUB_RAW_BASE_URL}/${path}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Twenty-Marketplace',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`GitHub raw file error: ${response.status}`);
    }

    return response.text();
  }

  private async loadAppManifestFromGithub(
    appPath: string,
  ): Promise<MarketplaceAppDTO | null> {
    const manifestContent = await this.fetchGitHubFile(
      `${appPath}/.twenty/output/manifest.json`,
    );

    if (!manifestContent) {
      return null;
    }

    const manifest = JSON.parse(manifestContent) as ApplicationManifest;

    const { application, packageJson } = manifest;
    const marketplaceData = application.marketplaceData;

    if (!marketplaceData?.author || !marketplaceData?.category) {
      return null;
    }

    return {
      id: application.universalIdentifier,
      name: application.displayName ?? packageJson.name,
      description: application.description ?? '',
      icon: application.icon ?? 'IconApps',
      version: packageJson.version,
      author: marketplaceData.author,
      category: marketplaceData.category,
      logo: this.resolveAssetUrl(appPath, marketplaceData.logo),
      screenshots: this.resolveAssetUrls(appPath, marketplaceData.screenshots),
      aboutDescription: marketplaceData.aboutDescription ?? '',
      providers: marketplaceData.providers ?? [],
      websiteUrl: marketplaceData.websiteUrl,
      termsUrl: marketplaceData.termsUrl,
    };
  }

  private resolveAssetUrl(
    appPath: string,
    relativePath: string | undefined,
  ): string | undefined {
    if (!relativePath) {
      return undefined;
    }

    return `${GITHUB_RAW_BASE_URL}/${appPath}/${relativePath}`;
  }

  private resolveAssetUrls(
    appPath: string,
    relativePaths: string[] | undefined,
  ): string[] {
    if (!relativePaths) {
      return [];
    }

    return relativePaths
      .map((path) => this.resolveAssetUrl(appPath, path))
      .filter((url): url is string => url !== undefined);
  }
}
