import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateMessageId } from 'twenty-shared/i18n';
import { compileApplicationTranslations } from '@/app/translations/compile-application-translations';

describe('compileApplicationTranslations', () => {
  it('compiles catalogs keyed by message id, skipping source locale and empty values', async () => {
    const appPath = await mkdtemp(join(tmpdir(), 'twenty-translations-'));
    const localesDir = join(appPath, 'locales');

    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, 'fr-FR.json'),
      JSON.stringify({ Company: 'Entreprise', Untranslated: '' }),
    );
    await writeFile(
      join(localesDir, 'en.json'),
      JSON.stringify({ Company: 'Company' }),
    );

    const result = await compileApplicationTranslations({ appPath });

    expect(result).toEqual({
      'fr-FR': { [generateMessageId('Company')]: 'Entreprise' },
    });
  });

  it('hashes a context-qualified key with its context so it matches the server lookup', async () => {
    const appPath = await mkdtemp(
      join(tmpdir(), 'twenty-translations-context-'),
    );
    const localesDir = join(appPath, 'locales');

    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, 'fr-FR.json'),
      JSON.stringify({
        door: { Open: 'Ouvrir' },
      }),
    );

    const result = await compileApplicationTranslations({ appPath });

    expect(result).toEqual({
      'fr-FR': { [generateMessageId('Open', 'door')]: 'Ouvrir' },
    });
  });

  it('declares nothing when there is no locales directory, so the sync leaves stored translations alone', async () => {
    const appPath = await mkdtemp(join(tmpdir(), 'twenty-translations-empty-'));

    expect(await compileApplicationTranslations({ appPath })).toBeUndefined();
  });

  it('declares zero locales when the locales directory exists but holds none', async () => {
    const appPath = await mkdtemp(
      join(tmpdir(), 'twenty-translations-no-locale-'),
    );

    await mkdir(join(appPath, 'locales'), { recursive: true });

    expect(await compileApplicationTranslations({ appPath })).toEqual({});
  });

  it('declares zero locales when only the source locale is present', async () => {
    const appPath = await mkdtemp(
      join(tmpdir(), 'twenty-translations-source-only-'),
    );
    const localesDir = join(appPath, 'locales');

    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, 'en.json'),
      JSON.stringify({ Company: 'Company' }),
    );

    expect(await compileApplicationTranslations({ appPath })).toEqual({});
  });

  it('merges compiled catalogs and lets an authored entry win on the same id', async () => {
    const appPath = await mkdtemp(join(tmpdir(), 'twenty-translations-merge-'));
    const localesDir = join(appPath, 'locales');
    await mkdir(join(localesDir, 'compiled'), { recursive: true });
    await writeFile(
      join(localesDir, 'fr-FR.json'),
      JSON.stringify({ Company: 'Entreprise' }),
    );
    await writeFile(
      join(localesDir, 'compiled', 'fr-FR.json'),
      JSON.stringify({
        [generateMessageId('Company')]: 'Société',
        zzzzzz: 'orphan',
      }),
    );

    expect(await compileApplicationTranslations({ appPath })).toEqual({
      'fr-FR': {
        [generateMessageId('Company')]: 'Entreprise',
        zzzzzz: 'orphan',
      },
    });
  });

  it('declares a locale that only has a compiled catalog', async () => {
    const appPath = await mkdtemp(
      join(tmpdir(), 'twenty-translations-compiled-only-'),
    );
    await mkdir(join(appPath, 'locales', 'compiled'), { recursive: true });
    await writeFile(
      join(appPath, 'locales', 'compiled', 'de-DE.json'),
      JSON.stringify({ zzzzzz: 'Waise' }),
    );

    expect(await compileApplicationTranslations({ appPath })).toEqual({
      'de-DE': { zzzzzz: 'Waise' },
    });
  });

  it('skips empty compiled entries and compiled files of unsupported locales', async () => {
    const appPath = await mkdtemp(
      join(tmpdir(), 'twenty-translations-compiled-skip-'),
    );
    await mkdir(join(appPath, 'locales', 'compiled'), { recursive: true });
    await writeFile(
      join(appPath, 'locales', 'compiled', 'fr-FR.json'),
      JSON.stringify({ aaaaaa: '', bbbbbb: 'kept' }),
    );
    await writeFile(
      join(appPath, 'locales', 'compiled', 'klingon.json'),
      JSON.stringify({ cccccc: 'nuqneH' }),
    );

    expect(await compileApplicationTranslations({ appPath })).toEqual({
      'fr-FR': { bbbbbb: 'kept' },
    });
  });

  it('skips a locale file whose JSON is not an object', async () => {
    const appPath = await mkdtemp(
      join(tmpdir(), 'twenty-translations-not-object-'),
    );
    const localesDir = join(appPath, 'locales');
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, 'fr-FR.json'), JSON.stringify(''));
    await writeFile(join(localesDir, 'de-DE.json'), JSON.stringify(['x']));
    await writeFile(
      join(localesDir, 'it-IT.json'),
      JSON.stringify({ Company: 'Azienda' }),
    );

    expect(await compileApplicationTranslations({ appPath })).toEqual({
      'it-IT': { [generateMessageId('Company')]: 'Azienda' },
    });
  });

  it('skips a locale file that cannot be parsed', async () => {
    const appPath = await mkdtemp(
      join(tmpdir(), 'twenty-translations-unparsable-'),
    );
    const localesDir = join(appPath, 'locales');
    await mkdir(join(localesDir, 'compiled'), { recursive: true });
    await writeFile(join(localesDir, 'fr-FR.json'), '');
    await writeFile(join(localesDir, 'compiled', 'de-DE.json'), '{');
    await writeFile(
      join(localesDir, 'it-IT.json'),
      JSON.stringify({ Company: 'Azienda' }),
    );

    expect(await compileApplicationTranslations({ appPath })).toEqual({
      'it-IT': { [generateMessageId('Company')]: 'Azienda' },
    });
  });
});
