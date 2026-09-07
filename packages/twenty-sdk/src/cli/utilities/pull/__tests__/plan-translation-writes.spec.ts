import {
  planTranslationWrites,
  type TranslationWritePlan,
} from '@/cli/utilities/pull/plan-translation-writes';
import { compileApplicationTranslations } from '@/cli/utilities/translations/compile-application-translations';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { generateMessageId } from 'twenty-shared/i18n';
import { describe, expect, it } from 'vitest';

const PET_LABEL_ID = generateMessageId('Pet', 'objectMetadata.labelSingular');

const buildManifest = (translations?: Record<string, unknown>): Manifest =>
  ({
    application: {},
    objects: [
      {
        universalIdentifier: 'pet',
        nameSingular: 'pet',
        namePlural: 'pets',
        labelSingular: 'Pet',
        labelPlural: 'Pets',
        fields: [],
      },
    ],
    fields: [],
    indexes: [],
    views: [],
    viewFields: [],
    ...(translations === undefined ? {} : { translations }),
  }) as unknown as Manifest;

const EXPORTED_TRANSLATIONS = {
  'fr-FR': { [PET_LABEL_ID]: 'Animal', zzzzzz: 'orphan' },
  'de-DE': { [PET_LABEL_ID]: 'Haustier' },
};

const createAppPath = () => mkdtemp(join(tmpdir(), 'plan-translation-writes-'));

const materialize = async (appPath: string, plan: TranslationWritePlan) => {
  for (const write of plan.writes) {
    await mkdir(dirname(join(appPath, write.relativePath)), {
      recursive: true,
    });
    await writeFile(join(appPath, write.relativePath), write.content);
  }

  for (const deletion of plan.deletions) {
    await rm(join(appPath, deletion.relativePath), { force: true });
  }
};

const describePlan = (plan: TranslationWritePlan) => ({
  writes: plan.writes.map(
    ({ relativePath, isRegeneration }) =>
      `${isRegeneration ? 'regenerate' : 'write'} ${relativePath}`,
  ),
  deletions: plan.deletions.map(({ relativePath }) => relativePath),
});

const pullFresh = async (appPath: string) => {
  const plan = await planTranslationWrites({
    appPath,
    manifest: buildManifest(EXPORTED_TRANSLATIONS),
    baseManifest: null,
    frontComponentSourcePaths: [],
  });

  await materialize(appPath, plan);

  return plan;
};

describe('planTranslationWrites', () => {
  it('should write the readable file and the compiled remainder of every exported locale on a fresh pull', async () => {
    const appPath = await createAppPath();

    const plan = await pullFresh(appPath);

    expect(describePlan(plan)).toEqual({
      writes: [
        'write locales/de-DE.json',
        'write locales/fr-FR.json',
        'write locales/compiled/fr-FR.json',
      ],
      deletions: [],
    });
    expect(plan.compiledEntryCountByLocale).toEqual({ 'fr-FR': 1 });
    expect(await compileApplicationTranslations(appPath)).toEqual(
      EXPORTED_TRANSLATIONS,
    );
  });

  it('should leave a locale alone when its catalog did not change since the base', async () => {
    const appPath = await createAppPath();

    await pullFresh(appPath);
    await writeFile(
      join(appPath, 'locales/de-DE.json'),
      JSON.stringify({ 'objectMetadata.labelSingular': { Pet: 'Tier' } }),
    );

    const plan = await planTranslationWrites({
      appPath,
      manifest: buildManifest(EXPORTED_TRANSLATIONS),
      baseManifest: buildManifest(EXPORTED_TRANSLATIONS),
      frontComponentSourcePaths: [],
    });

    expect(describePlan(plan)).toEqual({ writes: [], deletions: [] });
    expect(plan.compiledEntryCountByLocale).toEqual({ 'fr-FR': 1 });
  });

  it('should restore a wanted file that went missing even when the catalog did not change', async () => {
    const appPath = await createAppPath();

    await pullFresh(appPath);
    await rm(join(appPath, 'locales/compiled/fr-FR.json'));

    const plan = await planTranslationWrites({
      appPath,
      manifest: buildManifest(EXPORTED_TRANSLATIONS),
      baseManifest: buildManifest(EXPORTED_TRANSLATIONS),
      frontComponentSourcePaths: [],
    });

    expect(describePlan(plan)).toEqual({
      writes: ['write locales/compiled/fr-FR.json'],
      deletions: [],
    });
  });

  it('should regenerate the locale that changed on the server and delete the one it dropped', async () => {
    const appPath = await createAppPath();

    await pullFresh(appPath);

    const plan = await planTranslationWrites({
      appPath,
      manifest: buildManifest({
        'fr-FR': { [PET_LABEL_ID]: 'Bête', zzzzzz: 'orphan' },
      }),
      baseManifest: buildManifest(EXPORTED_TRANSLATIONS),
      frontComponentSourcePaths: [],
    });

    expect(describePlan(plan)).toEqual({
      writes: ['regenerate locales/fr-FR.json'],
      deletions: ['locales/de-DE.json'],
    });
    expect(plan.writes[0].content).toContain('Bête');
  });

  it('should delete the compiled file once every entry of a locale can be decoded', async () => {
    const appPath = await createAppPath();

    await pullFresh(appPath);

    const plan = await planTranslationWrites({
      appPath,
      manifest: buildManifest({
        'fr-FR': { [PET_LABEL_ID]: 'Animal' },
        'de-DE': { [PET_LABEL_ID]: 'Haustier' },
      }),
      baseManifest: buildManifest(EXPORTED_TRANSLATIONS),
      frontComponentSourcePaths: [],
    });

    expect(describePlan(plan)).toEqual({
      writes: [],
      deletions: ['locales/compiled/fr-FR.json'],
    });
    expect(plan.compiledEntryCountByLocale).toEqual({});
  });

  it('should promote entries whose source landed since the last pull without touching other local edits', async () => {
    const appPath = await createAppPath();
    const noContentId = generateMessageId('No content yet');
    const catalog = buildManifest({
      'fr-FR': {
        [PET_LABEL_ID]: 'Animal',
        [noContentId]: 'Rien pour le moment',
      },
    });

    const firstPlan = await planTranslationWrites({
      appPath,
      manifest: catalog,
      baseManifest: null,
      frontComponentSourcePaths: [],
    });

    await materialize(appPath, firstPlan);
    await writeFile(
      join(appPath, 'locales/fr-FR.json'),
      JSON.stringify({ 'objectMetadata.labelSingular': { Pet: 'Bête' } }),
    );

    const componentPath = join(appPath, 'card.front-component.tsx');

    await writeFile(
      componentPath,
      `
      import { t } from 'twenty-sdk/front-component';

      const Component = () => t('No content yet');

      export default defineFrontComponent({ component: Component });
      `,
    );

    const plan = await planTranslationWrites({
      appPath,
      manifest: catalog,
      baseManifest: catalog,
      frontComponentSourcePaths: [componentPath],
    });

    expect(describePlan(plan)).toEqual({
      writes: ['regenerate locales/fr-FR.json'],
      deletions: ['locales/compiled/fr-FR.json'],
    });
    expect(JSON.parse(plan.writes[0].content)).toEqual({
      'No content yet': 'Rien pour le moment',
      'objectMetadata.labelSingular': { Pet: 'Bête' },
    });
    expect(plan.compiledEntryCountByLocale).toEqual({});

    await materialize(appPath, plan);

    expect(
      JSON.parse(await readFile(join(appPath, 'locales/fr-FR.json'), 'utf8')),
    ).toEqual({
      'No content yet': 'Rien pour le moment',
      'objectMetadata.labelSingular': { Pet: 'Bête' },
    });
  });

  it('should only write the compiled file for a locale with no decodable entry', async () => {
    const appPath = await createAppPath();

    const plan = await planTranslationWrites({
      appPath,
      manifest: buildManifest({ 'es-ES': { zzzzzz: 'huérfano' } }),
      baseManifest: null,
      frontComponentSourcePaths: [],
    });

    expect(describePlan(plan)).toEqual({
      writes: ['write locales/compiled/es-ES.json'],
      deletions: [],
    });
  });

  it('should touch nothing when the export says nothing about translations', async () => {
    const appPath = await createAppPath();

    await pullFresh(appPath);

    const plan = await planTranslationWrites({
      appPath,
      manifest: buildManifest(),
      baseManifest: buildManifest(EXPORTED_TRANSLATIONS),
      frontComponentSourcePaths: [],
    });

    expect(describePlan(plan)).toEqual({ writes: [], deletions: [] });
  });
});
