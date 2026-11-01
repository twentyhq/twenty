import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { type Manifest } from 'twenty-shared/application';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { extractApplicationTranslations } from '@/app/translations/extract-application-translations';

const MANIFEST = {
  objects: [{ labelSingular: 'Invoice', labelPlural: 'Invoices' }],
  fields: [{ label: 'Invoice' }],
} as unknown as Manifest;

describe('extractApplicationTranslations', () => {
  let appPath: string;
  const extract = (options = {}) =>
    extractApplicationTranslations({
      appPath,
      manifest: MANIFEST,
      signal: new AbortController().signal,
      ...options,
    });
  const readCatalog = async (name: string) =>
    JSON.parse(await readFile(join(appPath, 'locales', name), 'utf8'));

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-extract-translations-'));
  });
  afterEach(() => rm(appPath, { recursive: true, force: true }));

  it('extracts metadata and front-component strings, preserves context-specific translations and removes obsolete entries', async () => {
    const componentPath = join(appPath, 'panel.tsx');
    await writeFile(
      componentPath,
      `
      t('Welcome');
      msg({ message: 'Open', context: 'door' });
      t({ message: 'Open', context: 'status' });
      t('Welcome');
      t(dynamicMessage);
      <Trans message="Save" />;
    `,
    );
    await mkdir(join(appPath, 'locales/compiled'), { recursive: true });
    await writeFile(
      join(appPath, 'locales/fr-FR.json'),
      JSON.stringify({
        Welcome: 'Bienvenue',
        Old: 'Ancien',
        door: { Open: 'Ouvrir' },
        status: { Open: 'Ouvert' },
        'objectMetadata.labelSingular': { Invoice: 'Facture' },
        'fieldMetadata.label': { Invoice: 'Facturation' },
      }),
    );
    await writeFile(
      join(appPath, 'locales/compiled/fr-FR.json'),
      '{"opaque":"Preserved"}',
    );

    const result = await extract({
      frontComponentSourcePaths: [componentPath],
    });

    expect(result).toEqual({
      sourceCount: 7,
      updatedLocaleFiles: ['locales/en.json', 'locales/fr-FR.json'],
    });
    expect(await readCatalog('en.json')).toEqual({
      Welcome: 'Welcome',
      Save: 'Save',
      door: { Open: 'Open' },
      status: { Open: 'Open' },
      'objectMetadata.labelSingular': { Invoice: 'Invoice' },
      'objectMetadata.labelPlural': { Invoices: 'Invoices' },
      'fieldMetadata.label': { Invoice: 'Invoice' },
    });
    expect(await readCatalog('fr-FR.json')).toEqual({
      Welcome: 'Bienvenue',
      Save: '',
      door: { Open: 'Ouvrir' },
      status: { Open: 'Ouvert' },
      'objectMetadata.labelSingular': { Invoice: 'Facture' },
      'objectMetadata.labelPlural': { Invoices: '' },
      'fieldMetadata.label': { Invoice: 'Facturation' },
    });
    expect(await readCatalog('compiled/fr-FR.json')).toEqual({
      opaque: 'Preserved',
    });
  });

  it('scaffolds a target catalog and preserves it on repeated extraction', async () => {
    await extract({ scaffoldLocale: 'fr-FR' });
    expect(await readCatalog('fr-FR.json')).toEqual({
      'objectMetadata.labelSingular': { Invoice: '' },
      'objectMetadata.labelPlural': { Invoices: '' },
      'fieldMetadata.label': { Invoice: '' },
    });
    await writeFile(
      join(appPath, 'locales/fr-FR.json'),
      JSON.stringify({
        'objectMetadata.labelSingular': { Invoice: 'Facture' },
      }),
    );
    await extract({ scaffoldLocale: 'fr-FR' });
    expect(
      (await readCatalog('fr-FR.json'))['objectMetadata.labelSingular'],
    ).toEqual({ Invoice: 'Facture' });
    expect(await readdir(join(appPath, 'locales'))).toEqual([
      'en.json',
      'fr-FR.json',
    ]);
  });

  it.each([
    '{',
    'null',
    '[]',
    '{"Invoice":42}',
    '{"context":{"Invoice":null}}',
  ])(
    'rejects invalid target catalog %s before changing any catalog',
    async (content) => {
      await mkdir(join(appPath, 'locales'));
      await writeFile(join(appPath, 'locales/en.json'), 'original source');
      await writeFile(join(appPath, 'locales/de-DE.json'), '{"Old":"Alt"}');
      await writeFile(join(appPath, 'locales/fr-FR.json'), content);
      await expect(extract()).rejects.toMatchObject({ code: 'INVALID_INPUT' });
      expect(await readFile(join(appPath, 'locales/en.json'), 'utf8')).toBe(
        'original source',
      );
      expect(await readCatalog('de-DE.json')).toEqual({ Old: 'Alt' });
      expect(await readFile(join(appPath, 'locales/fr-FR.json'), 'utf8')).toBe(
        content,
      );
    },
  );

  it('does not create catalogs when cancelled', async () => {
    await expect(extract({ signal: AbortSignal.abort() })).rejects.toThrow();
    expect(await readdir(appPath)).toEqual([]);
  });

  it('refuses a symlinked staging directory before creating catalogs', async () => {
    const outside = join(appPath, 'outside');
    await mkdir(outside);
    await symlink(outside, join(appPath, '.twenty'));

    await expect(extract()).rejects.toThrow('symbolic links');
    expect(await readdir(outside)).toEqual([]);
    expect(await readdir(appPath)).not.toContain('locales');
  });

  it('refuses a symlinked target catalog without modifying its destination', async () => {
    const outside = join(appPath, 'outside.json');
    await writeFile(outside, '{"Keep":"Me"}');
    await mkdir(join(appPath, 'locales'));
    await symlink(outside, join(appPath, 'locales/fr-FR.json'));
    await expect(extract()).rejects.toThrow('symbolic links');
    expect(await readFile(outside, 'utf8')).toBe('{"Keep":"Me"}');
    expect(await readdir(join(appPath, 'locales'))).toEqual(['fr-FR.json']);
  });
});
