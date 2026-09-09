import {
  PULL_BASE_FILE_PATH,
  readPullBaseManifest,
  writePullBaseManifest,
} from '@/cli/utilities/pull/pull-base-file';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const PET_UID = '22222222-2222-4222-8222-222222222222';
const NAME_FIELD_UID = '33333333-3333-4333-8333-333333333333';
const VIEW_UID = '44444444-4444-4444-8444-444444444444';
const VIEW_FIELD_UID = '55555555-5555-4555-8555-555555555555';
const PAGE_LAYOUT_UID = '66666666-6666-4666-8666-666666666666';
const PAGE_LAYOUT_TAB_UID = '77777777-7777-4777-8777-777777777777';

const MANIFEST = {
  application: {
    universalIdentifier: APP_UID,
    displayName: 'Pets',
    description: '',
    defaultRoleUniversalIdentifier: 'role-uid',
  },
  objects: [
    {
      universalIdentifier: PET_UID,
      nameSingular: 'pet',
      namePlural: 'pets',
      labelSingular: 'Pet',
      labelPlural: 'Pets',
      labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UID,
      fields: [
        {
          universalIdentifier: NAME_FIELD_UID,
          name: 'name',
          label: 'Name',
          type: 'TEXT',
        },
      ],
    },
  ],
  fields: [],
  indexes: [],
  views: [
    {
      universalIdentifier: VIEW_UID,
      name: 'Overview',
      objectUniversalIdentifier: PET_UID,
    },
  ],
  viewFields: [
    {
      universalIdentifier: VIEW_FIELD_UID,
      viewUniversalIdentifier: VIEW_UID,
      fieldMetadataUniversalIdentifier: NAME_FIELD_UID,
      position: 0,
    },
  ],
  pageLayouts: [
    {
      universalIdentifier: PAGE_LAYOUT_UID,
      name: 'Overview',
      type: 'RECORD_PAGE',
      objectUniversalIdentifier: PET_UID,
    },
  ],
  pageLayoutTabs: [
    {
      universalIdentifier: PAGE_LAYOUT_TAB_UID,
      pageLayoutUniversalIdentifier: 'a-page-layout-of-another-application',
      title: 'Extra',
      position: 60,
    },
  ],
} as unknown as Manifest;

describe('pull base file', () => {
  let appPath: string;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'pull-base-file-'));
  });

  afterEach(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  const readBase = (applicationUniversalIdentifier = APP_UID) =>
    readPullBaseManifest({ appPath, applicationUniversalIdentifier });

  const writeRawBaseFile = async (content: string) => {
    const baseFilePath = join(appPath, PULL_BASE_FILE_PATH);

    await mkdir(dirname(baseFilePath), { recursive: true });
    await writeFile(baseFilePath, content);
  };

  it('should read back the manifest it wrote', async () => {
    await writePullBaseManifest({ appPath, manifest: MANIFEST });

    expect(await readBase()).toEqual(MANIFEST);
  });

  it('should ignore a base written for another application', async () => {
    await writePullBaseManifest({ appPath, manifest: MANIFEST });

    expect(await readBase('another-application-identifier')).toBeNull();
  });

  it('should ignore a base written with another file version', async () => {
    await writeRawBaseFile(
      JSON.stringify({
        version: 999,
        applicationUniversalIdentifier: APP_UID,
        manifest: MANIFEST,
      }),
    );

    expect(await readBase()).toBeNull();
  });

  it('should read back a base whose manifest has no views and no view fields', async () => {
    const {
      views: _views,
      viewFields: _viewFields,
      ...manifestWithoutViews
    } = MANIFEST;

    await writeRawBaseFile(
      JSON.stringify({
        version: 1,
        applicationUniversalIdentifier: APP_UID,
        manifest: manifestWithoutViews,
      }),
    );

    expect(await readBase()).toEqual(manifestWithoutViews);
  });

  it('should ignore a base whose views contain an entry without a universal identifier', async () => {
    await writeRawBaseFile(
      JSON.stringify({
        version: 1,
        applicationUniversalIdentifier: APP_UID,
        manifest: {
          ...MANIFEST,
          views: [{ name: 'Overview', objectUniversalIdentifier: PET_UID }],
        },
      }),
    );

    expect(await readBase()).toBeNull();
  });

  it('should ignore a base whose view fields are not a list', async () => {
    await writeRawBaseFile(
      JSON.stringify({
        version: 1,
        applicationUniversalIdentifier: APP_UID,
        manifest: {
          ...MANIFEST,
          viewFields: { universalIdentifier: VIEW_FIELD_UID },
        },
      }),
    );

    expect(await readBase()).toBeNull();
  });

  it('should read back a base whose manifest has no page layouts and no page layout tabs', async () => {
    const {
      pageLayouts: _pageLayouts,
      pageLayoutTabs: _pageLayoutTabs,
      ...manifestWithoutPageLayouts
    } = MANIFEST;

    await writeRawBaseFile(
      JSON.stringify({
        version: 1,
        applicationUniversalIdentifier: APP_UID,
        manifest: manifestWithoutPageLayouts,
      }),
    );

    expect(await readBase()).toEqual(manifestWithoutPageLayouts);
  });

  it('should ignore a base whose page layouts contain an entry without a universal identifier', async () => {
    await writeRawBaseFile(
      JSON.stringify({
        version: 1,
        applicationUniversalIdentifier: APP_UID,
        manifest: {
          ...MANIFEST,
          pageLayouts: [{ name: 'Overview', type: 'RECORD_PAGE' }],
        },
      }),
    );

    expect(await readBase()).toBeNull();
  });

  it('should ignore a base whose page layout tabs are not a list', async () => {
    await writeRawBaseFile(
      JSON.stringify({
        version: 1,
        applicationUniversalIdentifier: APP_UID,
        manifest: {
          ...MANIFEST,
          pageLayoutTabs: { universalIdentifier: PAGE_LAYOUT_TAB_UID },
        },
      }),
    );

    expect(await readBase()).toBeNull();
  });

  it('should return null when no base file has been written', async () => {
    expect(await readBase()).toBeNull();
  });

  it('should return null when the base file is not valid JSON', async () => {
    await writeRawBaseFile('{ "version": 1, ');

    expect(await readBase()).toBeNull();
  });
});
