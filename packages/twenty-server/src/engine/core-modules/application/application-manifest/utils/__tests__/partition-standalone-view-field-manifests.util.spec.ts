import {
  getSystemViewUniversalIdentifier,
  type StandaloneViewFieldManifest,
  SYSTEM_VIEW_KEYS,
} from 'twenty-shared/application';

import { partitionStandaloneViewFieldManifests } from 'src/engine/core-modules/application/application-manifest/utils/partition-standalone-view-field-manifests.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'f1f2f3f4-f5f6-4000-8000-000000000001';
const OWN_OBJECT_UNIVERSAL_IDENTIFIER = 'e1e2e3e4-e5e6-4000-8000-000000000001';
const OWN_VIEW_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const FOREIGN_VIEW_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000002';

const buildViewFieldManifest = ({
  universalIdentifier,
  viewUniversalIdentifier,
}: {
  universalIdentifier: string;
  viewUniversalIdentifier: string;
}): StandaloneViewFieldManifest => ({
  universalIdentifier,
  viewUniversalIdentifier,
  fieldMetadataUniversalIdentifier: 'b1b2b3b4-b5b6-4000-8000-000000000001',
  position: 0,
});

describe('partitionStandaloneViewFieldManifests', () => {
  it('keeps view fields on the app own views and on the system views of its own objects, and suggests the others', () => {
    const ownViewFieldManifest = buildViewFieldManifest({
      universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000001',
      viewUniversalIdentifier: OWN_VIEW_UNIVERSAL_IDENTIFIER,
    });
    const ownIndexViewFieldManifest = buildViewFieldManifest({
      universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000002',
      viewUniversalIdentifier: getSystemViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          APPLICATION_UNIVERSAL_IDENTIFIER,
        objectUniversalIdentifier: OWN_OBJECT_UNIVERSAL_IDENTIFIER,
        viewKey: SYSTEM_VIEW_KEYS.INDEX,
      }),
    });
    const suggestedViewFieldManifest = buildViewFieldManifest({
      universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000003',
      viewUniversalIdentifier: FOREIGN_VIEW_UNIVERSAL_IDENTIFIER,
    });

    expect(
      partitionStandaloneViewFieldManifests({
        manifest: {
          objects: [{ universalIdentifier: OWN_OBJECT_UNIVERSAL_IDENTIFIER }],
          views: [{ universalIdentifier: OWN_VIEW_UNIVERSAL_IDENTIFIER }],
          viewFields: [
            ownViewFieldManifest,
            ownIndexViewFieldManifest,
            suggestedViewFieldManifest,
          ],
        },
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual({
      ownViewFieldManifests: [ownViewFieldManifest, ownIndexViewFieldManifest],
      suggestedViewFieldManifests: [suggestedViewFieldManifest],
    });
  });

  it('handles a manifest without objects, views or view fields', () => {
    expect(
      partitionStandaloneViewFieldManifests({
        manifest: {},
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual({
      ownViewFieldManifests: [],
      suggestedViewFieldManifests: [],
    });
  });
});
