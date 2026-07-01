import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { getTranslationCatalogKey } from '@/sdk/front-component/translations/message';
import { collectTranslatableStrings } from '@/cli/utilities/translations/collect-translatable-strings';
import { compileApplicationTranslations } from '@/cli/utilities/translations/compile-application-translations';
import { generateMessageId } from '@/cli/utilities/translations/generate-message-id';
import { type Manifest } from 'twenty-shared/application';

const buildManifest = (overrides: Record<string, unknown>): Manifest =>
  ({
    application: {},
    objects: [],
    fields: [],
    views: [],
    pageLayoutTabs: [],
    commandMenuItems: [],
    navigationMenuItems: [],
    ...overrides,
  }) as unknown as Manifest;

describe('generateMessageId', () => {
  it('is deterministic and six characters long', () => {
    expect(generateMessageId('Company')).toHaveLength(6);
    expect(generateMessageId('Company')).toBe(generateMessageId('Company'));
  });

  it('differs for different sources and contexts', () => {
    expect(generateMessageId('Company')).not.toBe(
      generateMessageId('Companies'),
    );
    expect(generateMessageId('Cancel', 'subscription')).not.toBe(
      generateMessageId('Cancel'),
    );
  });
});

describe('collectTranslatableStrings', () => {
  it('collects and dedupes object and field strings', () => {
    const manifest = buildManifest({
      objects: [
        {
          labelSingular: 'Company',
          labelPlural: 'Companies',
          description: 'A company',
        },
      ],
      fields: [
        { label: 'Name', description: 'Name' },
        { label: 'Company', description: '' },
      ],
    });

    expect(collectTranslatableStrings(manifest)).toEqual([
      'A company',
      'Companies',
      'Company',
      'Name',
    ]);
  });
});

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

    const result = await compileApplicationTranslations(appPath);

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
        [getTranslationCatalogKey('Open', 'door')]: 'Ouvrir',
      }),
    );

    const result = await compileApplicationTranslations(appPath);

    expect(result).toEqual({
      'fr-FR': { [generateMessageId('Open', 'door')]: 'Ouvrir' },
    });
  });

  it('returns undefined when there is no locales directory', async () => {
    const appPath = await mkdtemp(join(tmpdir(), 'twenty-translations-empty-'));

    expect(await compileApplicationTranslations(appPath)).toBeUndefined();
  });
});
