import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { TwentyConfig } from '../types/config.types';

type PersistedConfig = TwentyConfig & {
  profiles?: Record<string, TwentyConfig>;
};

const DEFAULT_PROFILE_NAME = 'default';

export class ConfigService {
  private readonly configPath: string;
  private static activeProfile = DEFAULT_PROFILE_NAME;

  constructor() {
    this.configPath = path.join(os.homedir(), '.twenty', 'config.json');
  }

  static setActiveProfile(name?: string) {
    this.activeProfile = name ?? DEFAULT_PROFILE_NAME;
  }

  static getActiveProfile(): string {
    return this.activeProfile;
  }

  private getActiveProfileName(): string {
    return ConfigService.getActiveProfile();
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
      const profile = this.getActiveProfileName();

      const profileConfig =
        profile === DEFAULT_PROFILE_NAME &&
        !raw.profiles?.[DEFAULT_PROFILE_NAME]
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
    const profile = this.getActiveProfileName();

    // Ensure profiles map exists
    if (!raw.profiles) {
      raw.profiles = {};
    }

    const currentProfile = raw.profiles[profile] || {};

    raw.profiles[profile] = { ...currentProfile, ...config };

    await fs.ensureDir(path.dirname(this.configPath));
    await fs.writeFile(this.configPath, JSON.stringify(raw, null, 2));
  }

  async clearConfig(): Promise<void> {
    // Clear only the active profile credentials (non-breaking for other profiles)
    const raw = await this.readRawConfig();
    const profile = this.getActiveProfileName();

    if (!raw.profiles) {
      raw.profiles = {};
    }

    if (raw.profiles[profile]) {
      delete raw.profiles[profile];
    }

    // Also clear legacy top-level apiKey for compatibility when active profile is default
    if (profile === DEFAULT_PROFILE_NAME) {
      const defaultConfig = this.getDefaultConfig();
      delete raw.apiKey;
      raw.apiUrl = defaultConfig.apiUrl;
    }

    await fs.ensureDir(path.dirname(this.configPath));
    await fs.writeFile(this.configPath, JSON.stringify(raw, null, 2));
  }

  async unsetKey(key: keyof TwentyConfig): Promise<void> {
    const raw = await this.readRawConfig();
    const profile = this.getActiveProfileName();
    if (!raw.profiles) {
      raw.profiles = {};
    }

    const prof = raw.profiles[profile] || {};
    delete (prof as any)[key];
    raw.profiles[profile] = prof;

    if (profile === DEFAULT_PROFILE_NAME) {
      delete (raw as any)[key];
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
