import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../../shared/types';
import { SecureStore, SettingsRecoveryError } from '../secure-store';

vi.mock('electron', () => ({ safeStorage: {} }));
let directory: string;
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'companion-settings-'));
});
afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

describe('saved preferences', () => {
  it('adds new defaults to existing installations without resetting their choices', async () => {
    await writeFile(
      join(directory, 'settings.json'),
      JSON.stringify({
        autoJoin: false,
        autoRecord: true,
        launchAtLogin: true,
        setupCompleted: true,
      }),
    );
    expect(await new SecureStore(directory).readSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      autoJoin: false,
      autoRecord: true,
      launchAtLogin: true,
      setupCompleted: true,
    });
  });

  it('restores custom appearance and notification preferences from disk', async () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      appearance: 'dark' as const,
      notifyOnDetectedCall: false,
      showMeetingCountdown: false,
    };
    await new SecureStore(directory).writeSettings(settings);
    expect(await new SecureStore(directory).readSettings()).toEqual(settings);
  });
});

it('returns isolated defaults for separate instances', async () => {
  const store = new SecureStore(directory);
  const settings = await store.readSettings();
  settings.autoRecord = true;
  expect((await store.readSettings()).autoRecord).toBe(false);
});

it('keeps valid preferences and a backup when an individual setting is invalid', async () => {
  const { readdir, readFile } = await import('node:fs/promises');
  const original = JSON.stringify({
    ...DEFAULT_SETTINGS,
    appearance: 'sepia',
    autoJoin: false,
    launchAtLogin: true,
  });
  await writeFile(join(directory, 'settings.json'), original);
  const error = await new SecureStore(directory)
    .readSettings()
    .catch((error: unknown) => error);
  expect(error).toBeInstanceOf(SettingsRecoveryError);
  expect((error as SettingsRecoveryError).settings).toMatchObject({
    appearance: 'system',
    autoJoin: false,
    launchAtLogin: true,
  });
  const backup = (await readdir(directory)).find((name) =>
    name.startsWith('settings.json.damaged-'),
  );
  expect(backup).toBeDefined();
  expect(await readFile(join(directory, backup!), 'utf8')).toBe(original);
});

it('does not enable automation when the saved file is malformed', async () => {
  await writeFile(join(directory, 'settings.json'), '{');
  const error = await new SecureStore(directory)
    .readSettings()
    .catch((error: unknown) => error);
  expect(error).toBeInstanceOf(SettingsRecoveryError);
  expect((error as SettingsRecoveryError).settings).toMatchObject({
    autoJoin: false,
    autoRecord: false,
  });
});

it('reports read failures instead of treating them as a new installation', async () => {
  const { mkdir } = await import('node:fs/promises');
  await mkdir(join(directory, 'settings.json'));
  await expect(new SecureStore(directory).readSettings()).rejects.toThrow(
    'Could not read your settings',
  );
});
