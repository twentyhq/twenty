import { Injectable, Logger } from '@nestjs/common';

// eslint-disable-next-line no-restricted-imports
import { lowerCase, upperFirst } from 'lodash';
import { type Manifest } from 'twenty-shared/application';
import { PackageJson } from 'type-fest';

import {
  MarketplaceAppDTO,
  MarketplaceAppFieldDTO,
  MarketplaceAppFrontComponentDTO,
  MarketplaceAppLogicFunctionDTO,
  MarketplaceAppObjectDTO,
} from 'src/engine/core-modules/application/dtos/marketplace-app.dto';

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

const CACHE_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  private cachedApps: MarketplaceAppDTO[] | null = null;
  private cacheTimestamp: number | null = null;

  async findAllMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
    if (this.isCacheValid()) {
      return this.cachedApps as MarketplaceAppDTO[];
    }

    const apps = await this.fetchAllMarketplaceApps();

    this.cachedApps = apps;
    this.cacheTimestamp = Date.now();

    return apps;
  }

  private isCacheValid(): boolean {
    if (this.cachedApps === null || this.cacheTimestamp === null) {
      return false;
    }

    return Date.now() - this.cacheTimestamp < CACHE_TTL_MS;
  }

  private async fetchAllMarketplaceApps(): Promise<MarketplaceAppDTO[]> {
    const apps: MarketplaceAppDTO[] = [];

    apps.push(this.loadMockApp());

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
              objects: [],
              fields: [],
              logicFunctions: [],
              frontComponents: [],
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

  private loadMockApp(): MarketplaceAppDTO {
    // SVG logo as data URL
    const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#1a2744"><ellipse cx="38" cy="20" rx="28" ry="10"/><rect x="10" y="20" width="56" height="50"/><ellipse cx="38" cy="70" rx="28" ry="10"/><ellipse cx="38" cy="35" rx="28" ry="10" fill="none" stroke="#fff" stroke-width="3"/><ellipse cx="38" cy="52" rx="28" ry="10" fill="none" stroke="#fff" stroke-width="3"/><circle cx="72" cy="62" r="22" fill="#1a2744"/><circle cx="72" cy="62" r="18" fill="#fff"/><path d="M72 50 L72 74 M62 58 L72 48 L82 58" stroke="#1a2744" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
    const logoDataUrl = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`;

    return {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Data Enrichment',
      description: 'Enrich your data easily. Choose your provider.',
      icon: 'IconSparkles',
      version: '1.0.0',
      author: 'Cosmos Labs',
      category: 'Data',
      logo: logoDataUrl,
      screenshots: [
        'https://placehold.co/800x400/f5f5f5/666?text=Screenshot+1',
        'https://placehold.co/800x400/f5f5f5/666?text=Screenshot+2',
        'https://placehold.co/800x400/f5f5f5/666?text=Screenshot+3',
      ],
      aboutDescription:
        'Enhance your workspace with automated data intelligence. This app monitors your new records and automatically populates missing details such as job titles, company size, social profiles, and industry insights.',
      providers: ['Clearbit', 'Apollo', 'Hunter.io'],
      websiteUrl: 'https://google.com',
      termsUrl: 'https://google.com',
      objects: [
        {
          universalIdentifier: 'a1b2c3d4-e5f6-7890-abcd-000000000001',
          nameSingular: 'enrichmentJob',
          namePlural: 'enrichmentJobs',
          labelSingular: 'Enrichment Job',
          labelPlural: 'Enrichment Jobs',
          description: 'Tracks data enrichment requests and their status',
          icon: 'IconSparkles',
          fields: [
            {
              name: 'status',
              type: 'SELECT',
              label: 'Status',
              description: 'Current status of the enrichment job',
              icon: 'IconProgressCheck',
            },
            {
              name: 'provider',
              type: 'TEXT',
              label: 'Provider',
              description: 'Enrichment provider used',
              icon: 'IconCloud',
            },
            {
              name: 'enrichedAt',
              type: 'DATE_TIME',
              label: 'Enriched At',
              description: 'When the enrichment was completed',
              icon: 'IconCalendar',
            },
            {
              name: 'recordId',
              type: 'TEXT',
              label: 'Record ID',
              description: 'ID of the enriched record',
              icon: 'IconKey',
            },
          ],
        },
      ],
      fields: [
        {
          name: 'industry',
          type: 'TEXT',
          label: 'Industry',
          description: 'Company industry from enrichment',
          icon: 'IconBuildingFactory2',
          objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        },
        {
          name: 'employeeCount',
          type: 'NUMBER',
          label: 'Employee Count',
          description: 'Number of employees from enrichment',
          icon: 'IconUsers',
          objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
        },
        {
          name: 'linkedInUrl',
          type: 'LINKS',
          label: 'LinkedIn URL',
          description: 'LinkedIn profile URL from enrichment',
          icon: 'IconBrandLinkedin',
          objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
        },
        {
          name: 'jobTitle',
          type: 'TEXT',
          label: 'Job Title',
          description: 'Job title from enrichment',
          icon: 'IconBriefcase',
          objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
        },
      ],
      logicFunctions: [
        {
          name: 'enrich-on-create',
          description:
            'Automatically enriches new records when they are created',
          timeoutSeconds: 30,
        },
      ],
      frontComponents: [],
    };
  }

  private async getAppDirectoriesFromGitHub(): Promise<string[]> {
    const directories: string[] = [];

    const rootContents = await this.fetchGitHubDirectory('');

    for (const entry of rootContents) {
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

    const packageJsonContent = await this.fetchGitHubFile(
      `${appPath}/.twenty/output/package.json`,
    );

    if (!packageJsonContent) {
      return null;
    }

    const manifest = JSON.parse(manifestContent) as Manifest;
    const packageJson = JSON.parse(packageJsonContent) as PackageJson;

    const { application } = manifest;
    const marketplaceData = application.marketplaceData;

    if (!marketplaceData?.author || !marketplaceData?.category) {
      return null;
    }

    const objects: MarketplaceAppObjectDTO[] = (manifest.objects ?? []).map(
      (manifestObject) => ({
        universalIdentifier: manifestObject.universalIdentifier,
        nameSingular: manifestObject.nameSingular,
        namePlural: manifestObject.namePlural,
        labelSingular: manifestObject.labelSingular,
        labelPlural: manifestObject.labelPlural,
        description: manifestObject.description,
        icon: manifestObject.icon,
        fields: (manifestObject.fields ?? []).map((field) => ({
          name: field.name ?? '',
          type: field.type,
          label: field.label ?? '',
          description: field.description,
          icon: field.icon,
        })),
      }),
    );

    const fields: MarketplaceAppFieldDTO[] = (manifest.fields ?? []).map(
      (manifestField) => {
        return {
          name: manifestField.name,
          type: manifestField.type,
          label: manifestField.label,
          description: manifestField.description,
          icon: manifestField.icon,
          objectUniversalIdentifier: manifestField.objectUniversalIdentifier,
        };
      },
    );

    const logicFunctions: MarketplaceAppLogicFunctionDTO[] = (
      manifest.logicFunctions ?? []
    ).map((manifestLogicFunction) => ({
      name: manifestLogicFunction.name ?? '',
      description: manifestLogicFunction.description,
      timeoutSeconds: manifestLogicFunction.timeoutSeconds,
    }));

    const frontComponents: MarketplaceAppFrontComponentDTO[] = (
      manifest.frontComponents ?? []
    ).map((manifestFrontComponent) => ({
      name: manifestFrontComponent.name ?? '',
      description: manifestFrontComponent.description,
    }));

    return {
      id: application.universalIdentifier,
      name: application.displayName,
      description: application.description ?? '',
      icon: application.icon ?? 'IconApps',
      version: packageJson.version ?? '0.1.0',
      author: marketplaceData.author,
      category: marketplaceData.category,
      logo: this.resolveAssetUrl(appPath, marketplaceData.logo),
      screenshots: this.resolveAssetUrls(appPath, marketplaceData.screenshots),
      aboutDescription: marketplaceData.aboutDescription ?? '',
      providers: marketplaceData.providers ?? [],
      websiteUrl: marketplaceData.websiteUrl,
      termsUrl: marketplaceData.termsUrl,
      objects,
      fields,
      logicFunctions,
      frontComponents,
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
