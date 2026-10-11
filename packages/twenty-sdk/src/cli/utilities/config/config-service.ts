import { readFile } from 'node:fs/promises';

import {
  ensurePrivateFile,
  writePrivateFile,
} from '@/cli/utilities/file/fs-utils';

import { getConfigPath } from '@/cli/utilities/config/get-config-path';

export type RemoteConfig = {
  apiUrl: string;
  apiKey?: string;
  // CLI OAuth app credentials (from `yarn twenty remote:add`)
  twentyCLIRegistrationId?: string;
  twentyCLIRegistrationClientId?: string;
  twentyCLIAccessToken?: string;
  twentyCLIRefreshToken?: string;
  // App registration credentials (from `createApplicationRegistration`)
  appRegistrationId?: string;
  appRegistrationClientId?: string;
};

type PersistedConfig = {
  version?: number;
  defaultRemote?: string;
  remotes?: Record<string, RemoteConfig>;
};

const CONFIG_VERSION = 1;

const DEFAULT_REMOTE_NAME = 'local';

export class ConfigService {
  private readonly configPath: string;
  private static activeRemote = DEFAULT_REMOTE_NAME;

  constructor(options?: { configPath?: string }) {
    this.configPath = options?.configPath ?? getConfigPath();
  }

  static setActiveRemote(name?: string) {
    this.activeRemote = name ?? DEFAULT_REMOTE_NAME;
  }

  static getActiveRemote(): string {
    return this.activeRemote;
  }

  private getActiveRemoteName(): string {
    return ConfigService.getActiveRemote();
  }

  private async readRawConfig(): Promise<PersistedConfig> {
    await ensurePrivateFile(this.configPath);
    const content = await readFile(this.configPath, 'utf8');
    const raw = JSON.parse(content || '{}');

    return raw as PersistedConfig;
  }

  async getConfig(): Promise<RemoteConfig> {
    return this.getConfigForRemote(this.getActiveRemoteName());
  }

  async getConfigForRemote(remoteName: string): Promise<RemoteConfig> {
    const defaultConfig = this.getDefaultConfig();

    try {
      const raw = await this.readRawConfig();
      const remoteConfig = raw.remotes?.[remoteName];

      if (!remoteConfig) {
        return defaultConfig;
      }

      return {
        apiUrl: remoteConfig.apiUrl || defaultConfig.apiUrl,
        apiKey: remoteConfig.apiKey,
        twentyCLIRegistrationId: remoteConfig.twentyCLIRegistrationId,
        twentyCLIRegistrationClientId:
          remoteConfig.twentyCLIRegistrationClientId,
        twentyCLIAccessToken: remoteConfig.twentyCLIAccessToken,
        twentyCLIRefreshToken: remoteConfig.twentyCLIRefreshToken,
        appRegistrationId: remoteConfig.appRegistrationId,
        appRegistrationClientId: remoteConfig.appRegistrationClientId,
      };
    } catch {
      return defaultConfig;
    }
  }

  async setConfig(config: Partial<RemoteConfig>): Promise<void> {
    const raw = await this.readRawConfig();
    const remote = this.getActiveRemoteName();

    raw.version = CONFIG_VERSION;

    if (!raw.remotes) {
      raw.remotes = {};
    }

    const currentRemote = raw.remotes[remote] ?? this.getDefaultConfig();

    raw.remotes[remote] = { ...currentRemote, ...config };

    await writePrivateFile(this.configPath, JSON.stringify(raw, null, 2));
  }

  async clearConfig(): Promise<void> {
    const raw = await this.readRawConfig();
    const remote = this.getActiveRemoteName();

    if (!raw.remotes) {
      raw.remotes = {};
    }

    if (raw.remotes[remote]) {
      delete raw.remotes[remote];
    }

    await writePrivateFile(this.configPath, JSON.stringify(raw, null, 2));
  }

  private getDefaultConfig(): RemoteConfig {
    return {
      apiUrl: 'http://localhost:2020',
    };
  }

  async getRemotes(): Promise<string[]> {
    try {
      const raw = await this.readRawConfig();
      const remotes = new Set<string>();

      remotes.add(DEFAULT_REMOTE_NAME);

      if (raw.remotes) {
        Object.keys(raw.remotes).forEach((name) => remotes.add(name));
      }

      return Array.from(remotes).sort();
    } catch {
      return [DEFAULT_REMOTE_NAME];
    }
  }

  async getDefaultRemote(): Promise<string> {
    try {
      const raw = await this.readRawConfig();

      return raw.defaultRemote ?? DEFAULT_REMOTE_NAME;
    } catch {
      return DEFAULT_REMOTE_NAME;
    }
  }

  async setDefaultRemote(name: string): Promise<void> {
    const raw = await this.readRawConfig();

    raw.defaultRemote = name;

    await writePrivateFile(this.configPath, JSON.stringify(raw, null, 2));
  }
}
