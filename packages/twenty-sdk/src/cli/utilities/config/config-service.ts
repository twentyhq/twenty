import { readFile, writeFile } from 'node:fs/promises';
import * as path from 'path';

import { ensureDir, ensureFile } from '@/cli/utilities/file/fs-utils';

import { getConfigPath } from '@/cli/utilities/config/get-config-path';

export type RemoteConfig = {
  apiUrl: string;
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  oauthClientId?: string;
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

  constructor() {
    this.configPath = getConfigPath();
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
    await ensureFile(this.configPath);
    const content = await readFile(this.configPath, 'utf8');
    const raw = JSON.parse(content || '{}');

    return this.migrateConfigIfNeeded(raw);
  }

  // TODO: Remove after 2026-04-30 — migrates legacy config format
  // (profiles, top-level keys, applicationAccessToken/applicationRefreshToken)
  // to the current format (remotes, accessToken/refreshToken)
  private async migrateConfigIfNeeded(
    raw: Record<string, unknown>,
  ): Promise<PersistedConfig> {
    if ((raw as PersistedConfig).version === CONFIG_VERSION) {
      return raw as PersistedConfig;
    }

    const hasLegacyProfiles = 'profiles' in raw;
    const hasTopLevelApiUrl = 'apiUrl' in raw && !('remotes' in raw);

    if (!hasLegacyProfiles && !hasTopLevelApiUrl) {
      return raw as PersistedConfig;
    }

    const migrated: PersistedConfig = { version: CONFIG_VERSION };

    const str = (value: unknown): string | undefined =>
      typeof value === 'string' ? value : undefined;

    const migrateRemoteFields = (
      source: Record<string, unknown>,
    ): RemoteConfig => ({
      apiUrl: str(source.apiUrl) ?? '',
      apiKey: str(source.apiKey),
      accessToken:
        str(source.accessToken) ?? str(source.applicationAccessToken),
      refreshToken:
        str(source.refreshToken) ?? str(source.applicationRefreshToken),
      oauthClientId: str(source.oauthClientId),
    });

    const profiles =
      (raw.profiles as Record<string, Record<string, unknown>> | undefined) ??
      {};

    migrated.remotes = {};

    for (const [name, profile] of Object.entries(profiles)) {
      const remoteName = name === 'default' ? DEFAULT_REMOTE_NAME : name;

      migrated.remotes[remoteName] = migrateRemoteFields(profile);
    }

    // Current-format remotes override legacy profiles — they're newer.
    const existingRemotes =
      (raw.remotes as Record<string, RemoteConfig> | undefined) ?? {};

    for (const [name, remote] of Object.entries(existingRemotes)) {
      const remoteName = name === 'default' ? DEFAULT_REMOTE_NAME : name;

      migrated.remotes[remoteName] = remote;
    }

    if (hasTopLevelApiUrl && !migrated.remotes[DEFAULT_REMOTE_NAME]) {
      migrated.remotes[DEFAULT_REMOTE_NAME] = migrateRemoteFields(
        raw as Record<string, unknown>,
      );
    }

    const legacyDefault = raw.defaultWorkspace as string | undefined;

    if (legacyDefault) {
      migrated.defaultRemote =
        legacyDefault === 'default' ? DEFAULT_REMOTE_NAME : legacyDefault;
    }

    await ensureDir(path.dirname(this.configPath));
    await writeFile(this.configPath, JSON.stringify(migrated, null, 2));

    return migrated;
  }

  async getConfig(): Promise<RemoteConfig> {
    if (process.env.TWENTY_TOKEN && process.env.TWENTY_API_URL) {
      return {
        apiUrl: process.env.TWENTY_API_URL,
        accessToken: process.env.TWENTY_TOKEN,
      };
    }

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
        apiUrl: remoteConfig.apiUrl ?? defaultConfig.apiUrl,
        apiKey: remoteConfig.apiKey,
        accessToken: remoteConfig.accessToken,
        refreshToken: remoteConfig.refreshToken,
        oauthClientId: remoteConfig.oauthClientId,
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

    const currentRemote = raw.remotes[remote] || { apiUrl: '' };

    raw.remotes[remote] = { ...currentRemote, ...config };

    await ensureDir(path.dirname(this.configPath));
    await writeFile(this.configPath, JSON.stringify(raw, null, 2));
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

    await ensureDir(path.dirname(this.configPath));
    await writeFile(this.configPath, JSON.stringify(raw, null, 2));
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

    await ensureDir(path.dirname(this.configPath));
    await writeFile(this.configPath, JSON.stringify(raw, null, 2));
  }
}
