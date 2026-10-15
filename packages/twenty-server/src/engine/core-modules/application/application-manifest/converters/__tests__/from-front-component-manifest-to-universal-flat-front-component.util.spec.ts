import {
  type FrontComponentManifest,
  type FrontComponentWidgetAvailabilityManifest,
} from 'twenty-shared/application';
import { PageLayoutType } from 'twenty-shared/types';

import { fromFrontComponentManifestToUniversalFlatFrontComponent } from 'src/engine/core-modules/application/application-manifest/converters/from-front-component-manifest-to-universal-flat-front-component.util';

const APP_UID = 'a8a8a8a8-a8a8-4a8a-a8a8-a8a8a8a8a8a8';
const FRONT_COMPONENT_UID = 'f1f1f1f1-f1f1-4f1f-b1f1-f1f1f1f1f1f1';
const COMPANY_UID = 'c0c0c0c0-c0c0-4c0c-a0c0-c0c0c0c0c0c0';
const PERSON_UID = 'd0d0d0d0-d0d0-4d0d-a0d0-d0d0d0d0d0d0';
const NOW = '2026-10-12T00:00:00.000Z';

const convertWidgetAvailability = (
  widgetAvailability?: FrontComponentWidgetAvailabilityManifest,
) => {
  const frontComponentManifest: FrontComponentManifest = {
    universalIdentifier: FRONT_COMPONENT_UID,
    name: 'My component',
    sourceComponentPath: 'src/my.front-component.tsx',
    builtComponentPath: 'src/my.front-component.mjs',
    builtComponentChecksum: 'checksum',
    componentName: 'MyComponent',
    widgetAvailability,
  };

  return fromFrontComponentManifestToUniversalFlatFrontComponent({
    frontComponentManifest,
    applicationUniversalIdentifier: APP_UID,
    isSettingsFrontComponent: false,
    now: NOW,
  }).universalWidgetAvailability;
};

describe('fromFrontComponentManifestToUniversalFlatFrontComponent', () => {
  it('should keep a front component out of every widget picker when widgetAvailability is omitted', () => {
    expect(convertWidgetAvailability()).toEqual([]);
  });

  it('should offer a front component on every record page', () => {
    expect(
      convertWidgetAvailability({
        pageLayoutType: PageLayoutType.RECORD_PAGE,
      }),
    ).toEqual([{ pageLayoutType: PageLayoutType.RECORD_PAGE }]);
  });

  it('should expand record page object restrictions into one entry per object', () => {
    expect(
      convertWidgetAvailability({
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        objectUniversalIdentifiers: [COMPANY_UID, PERSON_UID],
      }),
    ).toEqual([
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

  it('should offer a front component on dashboards', () => {
    expect(
      convertWidgetAvailability({ pageLayoutType: PageLayoutType.DASHBOARD }),
    ).toEqual([{ pageLayoutType: PageLayoutType.DASHBOARD }]);
  });
});
