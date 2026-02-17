import * as fs from 'fs-extra';
import * as path from 'path';

import { getConfigPath } from '@/cli/utilities/config/get-config-path';

export type TwentyConfig = {
  apiUrl: string;
  apiKey?: string;
  applicationTokenPairsByApplicationUniversalIdentifier?: Record<
    string,
    ApplicationTokenPair
  >;
};

export type ApplicationAuthToken = {
  token: string;
  expiresAt: string;
};

export type ApplicationTokenPair = {
  applicationAccessToken: ApplicationAuthToken;
  applicationRefreshToken: ApplicationAuthToken;
};

type PersistedConfig = TwentyConfig & {
  profiles?: Record<string, TwentyConfig>;
  defaultWorkspace?: string;
};

const DEFAULT_WORKSPACE_NAME = 'default';

export class ConfigService {
  private readonly configPath: string;
  private static activeWorkspace = DEFAULT_WORKSPACE_NAME;

  constructor() {
    this.configPath = getConfigPath();
  }

  static setActiveWorkspace(name?: string) {
    this.activeWorkspace = name ?? DEFAULT_WORKSPACE_NAME;
  }

  static getActiveWorkspace(): string {
    return this.activeWorkspace;
  }

  private getActiveWorkspaceName(): string {
    return ConfigService.getActiveWorkspace();
  }

  private async readRawConfig(): Promise<PersistedConfig> {
    await fs.ensureFile(this.configPath);
    const content = await fs.readFile(this.configPath, 'utf8');
    return JSON.parse(content || '{}');
  }

  async getConfig(): Promise<TwentyConfig> {
    return this.getConfigForWorkspace(this.getActiveWorkspaceName());
  }

  async getConfigForWorkspace(workspaceName: string): Promise<TwentyConfig> {
    try {
      const raw = await this.readRawConfig();

      return this.resolveEffectiveProfile(raw, workspaceName);
    } catch {
      return this.getDefaultConfig();
    }
  }

  async setConfig(config: Partial<TwentyConfig>): Promise<void> {
    const raw = await this.readRawConfig();
    const profile = this.getActiveWorkspaceName();

    // Ensure profiles map exists
    if (!raw.profiles) {
      raw.profiles = {};
    }

    const currentProfile = this.resolveEffectiveProfile(raw, profile);

    raw.profiles[profile] = { ...currentProfile, ...config };

    await fs.ensureDir(path.dirname(this.configPath));
    await fs.writeFile(this.configPath, JSON.stringify(raw, null, 2));
  }

  async clearConfig(): Promise<void> {
    // Clear only the active profile credentials (non-breaking for other profiles)
    const raw = await this.readRawConfig();
    const profile = this.getActiveWorkspaceName();

    if (!raw.profiles) {
      raw.profiles = {};
    }

    if (raw.profiles[profile]) {
      delete raw.profiles[profile];
    }

    // Also clear legacy top-level apiKey for compatibility when active profile is default
    if (profile === DEFAULT_WORKSPACE_NAME) {
      const defaultConfig = this.getDefaultConfig();
      delete raw.apiKey;
      raw.apiUrl = defaultConfig.apiUrl;
    }

    await fs.ensureDir(path.dirname(this.configPath));
    await fs.writeFile(this.configPath, JSON.stringify(raw, null, 2));
  }

  async getApplicationTokenPair(
    applicationUniversalIdentifier: string,
  ): Promise<ApplicationTokenPair | undefined> {
    const config = await this.getConfig();

    return config.applicationTokenPairsByApplicationUniversalIdentifier?.[
      applicationUniversalIdentifier
    ];
  }

  async setApplicationTokenPair({
    applicationUniversalIdentifier,
    applicationTokenPair,
  }: {
    applicationUniversalIdentifier: string;
    applicationTokenPair: ApplicationTokenPair;
  }): Promise<void> {
    const raw = await this.readRawConfig();
    const profile = this.getActiveWorkspaceName();

    if (!raw.profiles) {
      raw.profiles = {};
    }

    const currentProfile = this.resolveEffectiveProfile(raw, profile);

    raw.profiles[profile] = {
      ...currentProfile,
      applicationTokenPairsByApplicationUniversalIdentifier: {
        ...(currentProfile.applicationTokenPairsByApplicationUniversalIdentifier ??
          {}),
        [applicationUniversalIdentifier]: applicationTokenPair,
      },
    };

    await fs.ensureDir(path.dirname(this.configPath));
    await fs.writeFile(this.configPath, JSON.stringify(raw, null, 2));
  }

  async clearApplicationTokenPair(
    applicationUniversalIdentifier: string,
  ): Promise<void> {
    const raw = await this.readRawConfig();
    const profile = this.getActiveWorkspaceName();

    if (!raw.profiles?.[profile]) {
      return;
    }

    const currentApplicationTokenPairs = {
      ...(raw.profiles[profile]
        .applicationTokenPairsByApplicationUniversalIdentifier ?? {}),
    };

    delete currentApplicationTokenPairs[applicationUniversalIdentifier];

    raw.profiles[profile] = {
      ...raw.profiles[profile],
      applicationTokenPairsByApplicationUniversalIdentifier:
        currentApplicationTokenPairs,
    };

    await fs.ensureDir(path.dirname(this.configPath));
    await fs.writeFile(this.configPath, JSON.stringify(raw, null, 2));
  }

  // Resolves the effective config for a workspace, handling legacy top-level
  // values for the default workspace. Used by both read (getConfigForWorkspace)
  // and write (setConfig, setApplicationTokenPair) paths so first-write to a
  // legacy config preserves apiUrl/apiKey instead of clobbering them.
  private resolveEffectiveProfile(
    raw: PersistedConfig,
    workspaceName: string,
  ): TwentyConfig {
    if (raw.profiles?.[workspaceName]) {
      return raw.profiles[workspaceName];
    }

    if (workspaceName === DEFAULT_WORKSPACE_NAME) {
      return {
        apiUrl: raw.apiUrl ?? this.getDefaultConfig().apiUrl,
        apiKey: raw.apiKey,
      };
    }

    return this.getDefaultConfig();
  }

  private getDefaultConfig(): TwentyConfig {
    return {
      apiUrl: 'http://localhost:3000',
    };
  }

  async getAvailableWorkspaces(): Promise<string[]> {
    try {
      const raw = await this.readRawConfig();
      const workspaces = new Set<string>();

      // Always include the default workspace
      workspaces.add(DEFAULT_WORKSPACE_NAME);

      // Add all profiles
      if (raw.profiles) {
        Object.keys(raw.profiles).forEach((name) => workspaces.add(name));
      }

      return Array.from(workspaces).sort();
    } catch {
      return [DEFAULT_WORKSPACE_NAME];
    }
  }

  async getDefaultWorkspace(): Promise<string> {
    try {
      const raw = await this.readRawConfig();
      return raw.defaultWorkspace ?? DEFAULT_WORKSPACE_NAME;
    } catch {
      return DEFAULT_WORKSPACE_NAME;
    }
  }

  async setDefaultWorkspace(name: string): Promise<void> {
    const raw = await this.readRawConfig();
    raw.defaultWorkspace = name;
    await fs.ensureDir(path.dirname(this.configPath));
    await fs.writeFile(this.configPath, JSON.stringify(raw, null, 2));
  }
}
