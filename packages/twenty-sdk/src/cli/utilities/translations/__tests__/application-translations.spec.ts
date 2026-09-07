import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { collectTranslatableStrings } from '@/cli/utilities/translations/collect-translatable-strings';
import { compileApplicationTranslations } from '@/cli/utilities/translations/compile-application-translations';
import { generateMessageId } from 'twenty-shared/i18n';
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

    expect(collectTranslatableStrings(manifest)).toEqual(
      expect.arrayContaining([
        { message: 'Company', context: 'objectMetadata.labelSingular' },
        { message: 'Companies', context: 'objectMetadata.labelPlural' },
        { message: 'A company', context: 'objectMetadata.description' },
        { message: 'Name', context: 'fieldMetadata.label' },
        { message: 'Name', context: 'fieldMetadata.description' },
        // the same string in two roles is two entries now
        { message: 'Company', context: 'fieldMetadata.label' },
      ]),
    );
  });

  // Pins every manifest collection the shared registry maps, so a change to
  // TRANSLATABLE_PROPERTIES_BY_METADATA_NAME that silently drops a collection
  // shows up here rather than as an app shipping untranslatable strings.
  it('collects every translatable property of every mapped manifest collection', () => {
    const manifest = buildManifest({
      objects: [
        {
          labelSingular: 'Rocket',
          labelPlural: 'Rockets',
          description: 'A rocket',
        },
      ],
      fields: [{ label: 'Thrust', description: 'Newtons' }],
      views: [{ name: 'All Rockets' }],
      pageLayoutTabs: [{ title: 'Telemetry' }],
      commandMenuItems: [{ label: 'Launch Rocket', shortLabel: 'Launch' }],
      navigationMenuItems: [{ name: 'Missions' }],
      timelineActivityTypes: [{ label: 'Launched a rocket' }],
      pageLayouts: [
        {
          name: 'Mission Control Layout',
          tabs: [{ title: 'Overview', widgets: [{ title: 'Fuel level' }] }],
        },
      ],
    });

    expect(collectTranslatableStrings(manifest)).toEqual(
      expect.arrayContaining([
        { message: 'Rocket', context: 'objectMetadata.labelSingular' },
        { message: 'Rockets', context: 'objectMetadata.labelPlural' },
        { message: 'A rocket', context: 'objectMetadata.description' },
        { message: 'Thrust', context: 'fieldMetadata.label' },
        { message: 'Newtons', context: 'fieldMetadata.description' },
        { message: 'All Rockets', context: 'view.name' },
        { message: 'Telemetry', context: 'pageLayoutTab.title' },
        { message: 'Launch Rocket', context: 'commandMenuItem.label' },
        { message: 'Launch', context: 'commandMenuItem.shortLabel' },
        { message: 'Missions', context: 'navigationMenuItem.name' },
        {
          message: 'Launched a rocket',
          context: 'timelineActivityType.label',
        },
        { message: 'Mission Control Layout', context: 'pageLayout.name' },
        { message: 'Overview', context: 'pageLayoutTab.title' },
        { message: 'Fuel level', context: 'pageLayoutWidget.title' },
      ]),
    );
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
        door: { Open: 'Ouvrir' },
      }),
    );

    const result = await compileApplicationTranslations(appPath);

    expect(result).toEqual({
      'fr-FR': { [generateMessageId('Open', 'door')]: 'Ouvrir' },
    });
  });

  it('returns no locales when there is no locales directory', async () => {
    const appPath = await mkdtemp(join(tmpdir(), 'twenty-translations-empty-'));

    expect(await compileApplicationTranslations(appPath)).toEqual({});
  });
});
