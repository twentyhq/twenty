import { Injectable, Logger } from '@nestjs/common';

// eslint-disable-next-line no-restricted-imports
import { lowerCase, upperFirst } from 'lodash';
import { type Manifest } from 'twenty-shared/application';
import { PackageJson } from 'type-fest';

import {
  MarketplaceAppDTO,
  MarketplaceAppDefaultRoleDTO,
  MarketplaceAppFieldDTO,
  MarketplaceAppFrontComponentDTO,
  MarketplaceAppLogicFunctionDTO,
  MarketplaceAppObjectDTO,
} from 'src/engine/core-modules/application/dtos/marketplace-app.dto';
import { MOCKED_MARKETPLACE_APP } from 'src/engine/core-modules/application/services/mocked-marketplace-app.constant';

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

    apps.push(MOCKED_MARKETPLACE_APP); // To remove once we have apps on marketplace

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
            `Failed to load manifest from ${appDir}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch marketplace apps from GitHub: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return apps;
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
          universalIdentifier: field.universalIdentifier,
          objectUniversalIdentifier: manifestObject.universalIdentifier,
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
          universalIdentifier: manifestField.universalIdentifier,
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

    const defaultRole = this.resolveDefaultRole(
      manifest,
      application.defaultRoleUniversalIdentifier,
    );

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
      defaultRole,
    };
  }

  private resolveDefaultRole(
    manifest: Manifest,
    defaultRoleUniversalIdentifier: string,
  ): MarketplaceAppDefaultRoleDTO | undefined {
    const roleManifest = manifest.roles?.find(
      (role) => role.universalIdentifier === defaultRoleUniversalIdentifier,
    );

    if (!roleManifest) {
      return undefined;
    }

    return {
      id: roleManifest.universalIdentifier,
      label: roleManifest.label,
      description: roleManifest.description,
      canReadAllObjectRecords: roleManifest.canReadAllObjectRecords ?? false,
      canUpdateAllObjectRecords:
        roleManifest.canUpdateAllObjectRecords ?? false,
      canSoftDeleteAllObjectRecords:
        roleManifest.canSoftDeleteAllObjectRecords ?? false,
      canDestroyAllObjectRecords:
        roleManifest.canDestroyAllObjectRecords ?? false,
      canUpdateAllSettings: roleManifest.canUpdateAllSettings ?? false,
      canAccessAllTools: roleManifest.canAccessAllTools ?? false,
      objectPermissions: (roleManifest.objectPermissions ?? []).map(
        (permission) => ({
          objectUniversalIdentifier: permission.objectUniversalIdentifier,
          canReadObjectRecords: permission.canReadObjectRecords,
          canUpdateObjectRecords: permission.canUpdateObjectRecords,
          canSoftDeleteObjectRecords: permission.canSoftDeleteObjectRecords,
          canDestroyObjectRecords: permission.canDestroyObjectRecords,
        }),
      ),
      fieldPermissions: (roleManifest.fieldPermissions ?? []).map(
        (permission) => ({
          objectUniversalIdentifier: permission.objectUniversalIdentifier,
          fieldUniversalIdentifier: permission.fieldUniversalIdentifier,
          canReadFieldValue: permission.canReadFieldValue,
          canUpdateFieldValue: permission.canUpdateFieldValue,
        }),
      ),
      permissionFlags: (roleManifest.permissionFlags ?? []).map((flag) =>
        flag.toString(),
      ),
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
