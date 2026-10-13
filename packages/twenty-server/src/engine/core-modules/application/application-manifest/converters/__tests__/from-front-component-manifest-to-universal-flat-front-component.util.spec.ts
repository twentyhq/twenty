import { type FrontComponentManifest } from 'twenty-shared/application';
import { PageLayoutType } from 'twenty-shared/types';

import { fromFrontComponentManifestToUniversalFlatFrontComponent } from 'src/engine/core-modules/application/application-manifest/converters/from-front-component-manifest-to-universal-flat-front-component.util';

const APP_UID = 'a8a8a8a8-a8a8-4a8a-a8a8-a8a8a8a8a8a8';
const FRONT_COMPONENT_UID = 'f1f1f1f1-f1f1-4f1f-b1f1-f1f1f1f1f1f1';
const COMPANY_UID = 'c0c0c0c0-c0c0-4c0c-a0c0-c0c0c0c0c0c0';
const PERSON_UID = 'd0d0d0d0-d0d0-4d0d-a0d0-d0d0d0d0d0d0';
const NOW = '2026-10-12T00:00:00.000Z';

const ALL_WIDGET_PICKERS = [
  { pageLayoutType: PageLayoutType.RECORD_PAGE },
  { pageLayoutType: PageLayoutType.DASHBOARD },
];

const buildManifest = (
  overrides: Partial<FrontComponentManifest> = {},
): FrontComponentManifest => ({
  universalIdentifier: FRONT_COMPONENT_UID,
  name: 'My component',
  sourceComponentPath: 'src/my.front-component.tsx',
  builtComponentPath: 'src/my.front-component.mjs',
  builtComponentChecksum: 'checksum',
  componentName: 'MyComponent',
  ...overrides,
});

const convert = ({
  frontComponentManifest = buildManifest(),
  isSettingsFrontComponent = false,
  isReferencedByCommandMenuItem = false,
}: {
  frontComponentManifest?: FrontComponentManifest;
  isSettingsFrontComponent?: boolean;
  isReferencedByCommandMenuItem?: boolean;
} = {}) =>
  fromFrontComponentManifestToUniversalFlatFrontComponent({
    frontComponentManifest,
    applicationUniversalIdentifier: APP_UID,
    isSettingsFrontComponent,
    isReferencedByCommandMenuItem,
    now: NOW,
  });

describe('fromFrontComponentManifestToUniversalFlatFrontComponent', () => {
  it('should offer a front component in every record page and dashboard picker by default', () => {
    expect(convert().universalWidgetAvailability).toEqual(ALL_WIDGET_PICKERS);
  });

  it('should keep the settings front component out of the widget pickers by default', () => {
    expect(
      convert({ isSettingsFrontComponent: true }).universalWidgetAvailability,
    ).toEqual([]);
  });

  it('should keep a front component opened from a command menu item out of the widget pickers by default', () => {
    expect(
      convert({ isReferencedByCommandMenuItem: true })
        .universalWidgetAvailability,
    ).toEqual([]);
  });

  it('should keep a headless front component out of the widget pickers by default', () => {
    expect(
      convert({ frontComponentManifest: buildManifest({ isHeadless: true }) })
        .universalWidgetAvailability,
    ).toEqual([]);
  });

  it('should honor an explicit widgetAvailability over the default', () => {
    expect(
      convert({
        frontComponentManifest: buildManifest({
          widgetAvailability: [{ pageLayoutType: PageLayoutType.DASHBOARD }],
        }),
        isSettingsFrontComponent: true,
      }).universalWidgetAvailability,
    ).toEqual([{ pageLayoutType: PageLayoutType.DASHBOARD }]);

    expect(
      convert({
        frontComponentManifest: buildManifest({ widgetAvailability: [] }),
      }).universalWidgetAvailability,
    ).toEqual([]);
  });

  it('should expand record page object restrictions into one entry per object', () => {
    expect(
      convert({
        frontComponentManifest: buildManifest({
          widgetAvailability: [
            { pageLayoutType: PageLayoutType.DASHBOARD },
            {
              pageLayoutType: PageLayoutType.RECORD_PAGE,
              objectUniversalIdentifiers: [COMPANY_UID, PERSON_UID],
            },
          ],
        }),
      }).universalWidgetAvailability,
    ).toEqual([
      { pageLayoutType: PageLayoutType.DASHBOARD },
      {
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        objectMetadataUniversalIdentifier: COMPANY_UID,
      },
      {
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        objectMetadataUniversalIdentifier: PERSON_UID,
      },
    ]);
  });

  it('should match no record page when the object restriction is empty', () => {
    expect(
      convert({
        frontComponentManifest: buildManifest({
          widgetAvailability: [
            {
              pageLayoutType: PageLayoutType.RECORD_PAGE,
              objectUniversalIdentifiers: [],
            },
          ],
        }),
      }).universalWidgetAvailability,
    ).toEqual([]);
  });
});
