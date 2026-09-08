import { randomUUID } from 'node:crypto';
import {
  readFile,
  writeFile,
  rename,
  mkdir,
  unlink,
  copyFile,
} from 'node:fs/promises';
import { join } from 'node:path';
import { safeStorage } from 'electron';
import { z } from 'zod';
import {
  DEFAULT_SETTINGS,
  settingsSchema,
  type Settings,
} from '../shared/types';

export const credentialsSchema = z.object({
  serverUrl: z.string().url(),
  clientId: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
});
export type Credentials = z.infer<typeof credentialsSchema>;

export class SettingsRecoveryError extends Error {
  constructor(
    readonly settings: Settings,
    message: string,
  ) {
    super(message);
  }
}

export class SecureStore {
  constructor(private directory: string) {}

  async readCredentials(): Promise<Credentials | null> {
    try {
      return credentialsSchema.parse(
        JSON.parse(
          safeStorage.decryptString(
            await readFile(join(this.directory, 'credentials')),
          ),
        ),
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw new Error(
        'Could not unlock your Twenty connection. Reconnect to Twenty.',
      );
    }
  }

  async writeCredentials(credentials: Credentials): Promise<void> {
    if (!safeStorage.isEncryptionAvailable())
      throw new Error(
        'macOS Keychain is unavailable. Your connection could not be saved.',
      );
    await this.writeAtomic(
      'credentials',
      safeStorage.encryptString(JSON.stringify(credentials)),
    );
  }

  async clearCredentials(): Promise<void> {
    await unlink(join(this.directory, 'credentials')).catch(
      (error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT') throw error;
      },
    );
  }

  async readSettings(): Promise<Settings> {
    const path = join(this.directory, 'settings.json');
    let contents: string;
    try {
      contents = await readFile(path, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT')
        return { ...DEFAULT_SETTINGS };
      throw new SettingsRecoveryError(
        { ...DEFAULT_SETTINGS, autoJoin: false, autoRecord: false },
        'Could not read your settings. Automatic joining and recording are off. Check Settings before continuing.',
      );
    }
    let saved: unknown;
    try {
      saved = JSON.parse(contents);
    } catch {
      saved = null;
    }
    const savedObject = z.record(z.string(), z.unknown()).safeParse(saved);
    const migrated = settingsSchema.safeParse({
      ...DEFAULT_SETTINGS,
      ...(savedObject.success ? savedObject.data : {}),
    });
    if (savedObject.success && migrated.success) return migrated.data;

    const recovered = {
      ...DEFAULT_SETTINGS,
      autoJoin: false,
      autoRecord: false,
    };
    if (savedObject.success) {
      for (const [key, schema] of Object.entries(settingsSchema.shape)) {
        const field = schema.safeParse(savedObject.data[key]);
        if (field.success) Object.assign(recovered, { [key]: field.data });
      }
    }
    // Keep the original available even if a later preference change saves the recovered settings.
    await copyFile(path, `${path}.damaged-${randomUUID()}`);
    throw new SettingsRecoveryError(
      recovered,
      'Some settings could not be restored. A backup was saved and valid preferences were kept. Review Settings before continuing.',
    );
  }

  async writeSettings(settings: Settings): Promise<void> {
    await this.writeAtomic(
      'settings.json',
      JSON.stringify(settingsSchema.parse(settings)),
    );
  }

  async readHandledMeetings(): Promise<string[]> {
    try {
      return z
        .array(z.string())
        .parse(
          JSON.parse(
            await readFile(
              join(this.directory, 'handled-meetings.json'),
              'utf8',
            ),
          ),
        );
    } catch {
      return [];
    }
  }

  async writeHandledMeetings(ids: string[]): Promise<void> {
    await this.writeAtomic(
      'handled-meetings.json',
      JSON.stringify(ids.slice(-500)),
    );
  }

  private async writeAtomic(
    name: string,
    data: string | Buffer,
  ): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const path = join(this.directory, name);
    const temporaryPath = `${path}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporaryPath, data, { mode: 0o600 });
      await rename(temporaryPath, path);
    } finally {
      await unlink(temporaryPath).catch(() => undefined);
    }
  }
}
