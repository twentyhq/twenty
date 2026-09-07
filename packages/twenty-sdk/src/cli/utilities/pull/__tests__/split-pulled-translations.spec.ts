import { splitPulledTranslations } from '@/cli/utilities/pull/split-pulled-translations';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { generateMessageId } from 'twenty-shared/i18n';
import { describe, expect, it } from 'vitest';

const PET_LABEL_ID = generateMessageId('Pet', 'objectMetadata.labelSingular');
const AGE_LABEL_ID = generateMessageId('Age', 'fieldMetadata.label');
const VIEW_NAME_ID = generateMessageId('All pets', 'view.name');

const buildManifest = (overrides: Record<string, unknown>): Manifest =>
  ({
    application: {},
    objects: [
      {
        universalIdentifier: 'pet',
        nameSingular: 'pet',
        namePlural: 'pets',
        labelSingular: 'Pet',
        labelPlural: 'Pets',
        description: 'A pet',
        fields: [
          {
            universalIdentifier: 'age',
            name: 'age',
            label: 'Age',
            description: '',
            type: 'NUMBER',
          },
        ],
      },
    ],
    fields: [],
    indexes: [],
    views: [
      {
        universalIdentifier: 'all-pets',
        name: 'All pets',
        objectUniversalIdentifier: 'pet',
      },
    ],
    viewFields: [],
    ...overrides,
  }) as unknown as Manifest;

describe('splitPulledTranslations', () => {
  it('should write entries whose source is a pulled label in the authoring format and keep the rest compiled', async () => {
    const catalogs = await splitPulledTranslations({
      manifest: buildManifest({
        translations: {
          'fr-FR': {
            [PET_LABEL_ID]: 'Animal',
            [AGE_LABEL_ID]: 'Âge',
            [VIEW_NAME_ID]: 'Tous les animaux',
            zzzzzz: 'orphan',
          },
        },
      }),
      frontComponentSourcePaths: [],
    });

    expect(catalogs).toEqual([
      {
        locale: 'fr-FR',
        authored: {
          'fieldMetadata.label': { Age: 'Âge' },
          'objectMetadata.labelSingular': { Pet: 'Animal' },
          'view.name': { 'All pets': 'Tous les animaux' },
        },
        compiled: { zzzzzz: 'orphan' },
      },
    ]);
  });

  it('should decode the strings of the front components it is given', async () => {
    const componentPath = join(
      await mkdtemp(join(tmpdir(), 'split-pulled-translations-')),
      'card.front-component.tsx',
    );

    await writeFile(
      componentPath,
      `
      import { t, Trans } from 'twenty-sdk/front-component';

      const Component = () => {
        const label = t('No content yet');
        const verb = t({ message: 'Open', context: 'door' });

        return <Trans context="card">Untitled</Trans>;
      };

      export default defineFrontComponent({ component: Component });
      `,
    );

    const catalogs = await splitPulledTranslations({
      manifest: buildManifest({
        translations: {
          'de-DE': {
            [generateMessageId('No content yet')]: 'Noch kein Inhalt',
            [generateMessageId('Open', 'door')]: 'Öffnen',
            [generateMessageId('Untitled', 'card')]: 'Ohne Titel',
          },
        },
      }),
      frontComponentSourcePaths: [componentPath],
    });

    expect(catalogs).toEqual([
      {
        locale: 'de-DE',
        authored: {
          'No content yet': 'Noch kein Inhalt',
          card: { Untitled: 'Ohne Titel' },
          door: { Open: 'Öffnen' },
        },
        compiled: {},
      },
    ]);
  });

  it('should keep an entry compiled when the label it was translated from has changed', async () => {
    const staleId = generateMessageId('Kitten', 'objectMetadata.labelSingular');

    const catalogs = await splitPulledTranslations({
      manifest: buildManifest({
        translations: { 'fr-FR': { [staleId]: 'Chaton' } },
      }),
      frontComponentSourcePaths: [],
    });

    expect(catalogs).toEqual([
      { locale: 'fr-FR', authored: {}, compiled: { [staleId]: 'Chaton' } },
    ]);
  });

  it('should order locales and return nothing for an export without translations', async () => {
    const catalogs = await splitPulledTranslations({
      manifest: buildManifest({
        translations: {
          'fr-FR': { [PET_LABEL_ID]: 'Animal' },
          'de-DE': { [PET_LABEL_ID]: 'Haustier' },
        },
      }),
      frontComponentSourcePaths: [],
    });

    expect(catalogs.map(({ locale }) => locale)).toEqual(['de-DE', 'fr-FR']);
    expect(
      await splitPulledTranslations({
        manifest: buildManifest({}),
        frontComponentSourcePaths: [],
      }),
    ).toEqual([]);
  });
});
