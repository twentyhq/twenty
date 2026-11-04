import { type Manifest } from 'twenty-shared/application';
import { FieldMetadataType, PageLayoutType } from 'twenty-shared/types';

import { buildApplicationContentFromManifest } from 'src/engine/core-modules/application/application-content/utils/build-application-content-from-manifest.util';

const buildManifest = (overrides: Partial<Manifest>): Manifest =>
  ({
    application: {},
    objects: [],
    fields: [],
    logicFunctions: [],
    frontComponents: [],
    permissionFlags: [],
    roles: [],
    skills: [],
    agents: [],
    publicAssets: [],
    views: [],
    viewFields: [],
    navigationMenuItems: [],
    pageLayouts: [],
    pageLayoutTabs: [],
    pageLayoutWidgets: [],
    commandMenuItems: [],
    timelineActivityTypes: [],
    settingsMenuItems: [],
    ...overrides,
  }) as Manifest;

describe('buildApplicationContentFromManifest', () => {
  it('should merge nested and standalone fields and count them per object', () => {
    const content = buildApplicationContentFromManifest(
      buildManifest({
        objects: [
          {
            universalIdentifier: 'invoice',
            labelPlural: 'Invoices',
            fields: [
              {
                universalIdentifier: 'amount',
                label: 'Amount',
                type: FieldMetadataType.NUMBER,
              },
            ],
          },
        ] as unknown as Manifest['objects'],
        fields: [
          {
            universalIdentifier: 'tier',
            label: 'Tier',
            type: FieldMetadataType.TEXT,
            objectUniversalIdentifier: 'company',
          },
        ] as unknown as Manifest['fields'],
        views: [
          {
            universalIdentifier: 'all-invoices',
            name: 'All invoices',
            objectUniversalIdentifier: 'invoice',
            fields: [
              {
                universalIdentifier: 'view-amount',
                position: 0,
                fieldMetadataUniversalIdentifier: 'amount',
              },
            ],
          },
        ] as unknown as Manifest['views'],
      }),
    );

    expect(content.objects).toEqual([
      expect.objectContaining({ label: 'Invoices', count: 1 }),
    ]);
    expect(content.fields).toEqual([
      expect.objectContaining({
        label: 'Amount',
        objectUniversalIdentifier: 'invoice',
        count: 1,
      }),
      expect.objectContaining({
        label: 'Tier',
        objectUniversalIdentifier: 'company',
        count: 0,
      }),
    ]);
    expect(content.views).toEqual([
      expect.objectContaining({ label: 'All invoices', count: 1 }),
    ]);
    expect(content.viewFields).toEqual([
      expect.objectContaining({ label: 'Amount', parentLabel: 'All invoices' }),
    ]);
  });

  it('should tag page layouts, logic functions and public assets', () => {
    const content = buildApplicationContentFromManifest(
      buildManifest({
        pageLayouts: [
          {
            universalIdentifier: 'invoice-page',
            name: 'Invoice page',
            type: PageLayoutType.RECORD_PAGE,
            tabs: [
              {
                universalIdentifier: 'overview',
                title: 'Overview',
                position: 0,
              },
            ],
          },
        ] as unknown as Manifest['pageLayouts'],
        logicFunctions: [
          {
            universalIdentifier: 'nightly',
            name: 'Nightly cleanup',
            cronTriggerSettings: { pattern: '0 0 * * *' },
          },
        ] as unknown as Manifest['logicFunctions'],
        publicAssets: [
          {
            filePath: 'logo.png',
            fileName: 'logo.png',
            fileType: 'png',
            checksum: null,
          },
          {
            filePath: 'terms.pdf',
            fileName: 'terms.pdf',
            fileType: 'pdf',
            checksum: null,
          },
        ],
        translations: { 'fr-FR': { hello: 'bonjour', bye: 'au revoir' } },
      }),
    );

    expect(content.pageLayouts).toEqual([
      expect.objectContaining({ tag: PageLayoutType.RECORD_PAGE, count: 1 }),
    ]);
    expect(content.pageLayoutTabs).toEqual([
      expect.objectContaining({
        label: 'Overview',
        parentLabel: 'Invoice page',
      }),
    ]);
    expect(content.logicFunctions).toEqual([
      expect.objectContaining({ label: 'Nightly cleanup', tag: 'CRON' }),
    ]);
    expect(content.publicAssets.map(({ tag }) => tag)).toEqual([
      'IMAGE',
      'FILE',
    ]);
    expect(content.translations).toEqual([
      expect.objectContaining({ label: 'fr-FR', count: 2 }),
    ]);
  });
});
