import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

export type TwentyConfig = {
  apiUrl: string;
  apiKey?: string;
};

type PersistedConfig = TwentyConfig & {
  profiles?: Record<string, TwentyConfig>;
};

const DEFAULT_WORKSPACE_NAME = 'default';

export class ConfigService {
  private readonly configPath: string;
  private static activeWorkspace = DEFAULT_WORKSPACE_NAME;

  constructor() {
    this.configPath = path.join(os.homedir(), '.twenty', 'config.json');
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
    const defaultConfig = this.getDefaultConfig();
    try {
      const raw = await this.readRawConfig();
      const profile = this.getActiveWorkspaceName();

      const profileConfig =
        profile === DEFAULT_WORKSPACE_NAME &&
        !raw.profiles?.[DEFAULT_WORKSPACE_NAME]
          ? raw
          : raw.profiles?.[profile];

      // Fallback to legacy top-level values if profile value is missing
      const apiUrl = profileConfig?.apiUrl ?? defaultConfig.apiUrl;
      const apiKey = profileConfig?.apiKey;

      return {
        apiUrl,
        apiKey,
      };
    } catch {
      return defaultConfig;
    }
  }

  async setConfig(config: Partial<TwentyConfig>): Promise<void> {
    const raw = await this.readRawConfig();
    const profile = this.getActiveWorkspaceName();

    // Ensure profiles map exists
    if (!raw.profiles) {
      raw.profiles = {};
    }

    const currentProfile = raw.profiles[profile] || { apiUrl: '' };

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

  private getDefaultConfig(): TwentyConfig {
    return {
      apiUrl: 'http://localhost:3000',
    };
  }
}
