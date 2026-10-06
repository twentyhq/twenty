import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { isString } from '@sniptt/guards';
import { beforeEach, describe, expect, it } from 'vitest';

import { readConfig } from '@/config/read-config';

describe('readConfig', () => {
  let configPath: string;

  const writeConfig = (content: unknown) =>
    writeFile(
      configPath,
      isString(content) ? content : JSON.stringify(content),
    );

  beforeEach(async () => {
    const directory = await mkdtemp(join(tmpdir(), 'twenty-cli-config-'));

    configPath = join(directory, 'config.json');
  });

  it('treats a missing or empty file as an empty config', async () => {
    await expect(readConfig(configPath)).resolves.toEqual({
      version: 1,
      remotes: {},
    });

    await writeConfig('');

    await expect(readConfig(configPath)).resolves.toEqual({
      version: 1,
      remotes: {},
    });
  });

  it('keeps version 1 names and unknown fields as they are', async () => {
    await writeConfig({
      version: 1,
      defaultRemote: 'local',
      futureSetting: { keep: true },
      remotes: {
        local: { apiUrl: 'http://localhost:3000', apiKey: 'local-key' },
        default: {
          apiUrl: 'https://prod.example.com',
          apiKey: 'prod-key',
          appRegistrationId: 'registration-1',
        },
      },
    });

    await expect(readConfig(configPath)).resolves.toEqual({
      version: 1,
      defaultRemote: 'local',
      futureSetting: { keep: true },
      remotes: {
        local: { apiUrl: 'http://localhost:3000', apiKey: 'local-key' },
        default: {
          apiUrl: 'https://prod.example.com',
          apiKey: 'prod-key',
          appRegistrationId: 'registration-1',
        },
      },
    });
  });

  it('reads the legacy profiles format without duplicating aliased secrets', async () => {
    await writeConfig({
      profiles: {
        default: { apiUrl: 'http://localhost:2020', apiKey: 'local-key' },
        prod: {
          apiUrl: 'https://acme.twenty.com',
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      },
      defaultWorkspace: 'default',
      otherSetting: 1,
    });

    await expect(readConfig(configPath)).resolves.toEqual({
      version: 1,
      defaultRemote: 'local',
      otherSetting: 1,
      remotes: {
        local: { apiUrl: 'http://localhost:2020', apiKey: 'local-key' },
        prod: {
          apiUrl: 'https://acme.twenty.com',
          twentyCLIAccessToken: 'access-token',
          twentyCLIRefreshToken: 'refresh-token',
        },
      },
    });
  });

  it('keeps a legacy default profile when local is already taken', async () => {
    await writeConfig({
      profiles: {
        default: { apiUrl: 'https://prod.example.com' },
        local: { apiUrl: 'http://localhost:2020' },
      },
      defaultWorkspace: 'default',
    });

    const config = await readConfig(configPath);

    expect(Object.keys(config.remotes).sort()).toEqual(['default', 'local']);
    expect(config.defaultRemote).toBe('default');
  });

  it('reads the legacy single-server format as the local remote', async () => {
    await writeConfig({ apiUrl: 'http://localhost:2020', apiKey: 'key' });

    await expect(readConfig(configPath)).resolves.toMatchObject({
      remotes: { local: { apiUrl: 'http://localhost:2020', apiKey: 'key' } },
    });
  });

  it('reports invalid JSON without quoting the file', async () => {
    await writeConfig('{"apiKey": SECRET_SENTINEL_TOKEN_12345}');

    const error = await readConfig(configPath).catch(
      (caught: unknown) => caught,
    );

    expect(error).toMatchObject({ code: 'INVALID_CONFIG', exitCode: 2 });
    expect(JSON.stringify(error)).not.toContain('SECRET');
    expect(String(error)).not.toContain('SECRET');
  });

  it.each([
    [{ version: 999, remotes: {} }, 'version 999 is not supported'],
    [{ version: 1, remotes: { prod: { apiKey: 'no-url' } } }, 'apiUrl'],
    [{ version: 1, remotes: {}, defaultRemote: 42 }, 'defaultRemote'],
  ])('rejects %j', async (content, reason) => {
    await writeConfig(content);

    await expect(readConfig(configPath)).rejects.toMatchObject({
      code: 'INVALID_CONFIG',
      message: expect.stringContaining(reason),
    });
  });
});
