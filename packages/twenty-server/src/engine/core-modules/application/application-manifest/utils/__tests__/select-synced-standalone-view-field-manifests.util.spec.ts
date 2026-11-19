import { type StandaloneViewFieldManifest } from 'twenty-shared/application';

import { selectSyncedStandaloneViewFieldManifests } from 'src/engine/core-modules/application/application-manifest/utils/select-synced-standalone-view-field-manifests.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'f1f2f3f4-f5f6-4000-8000-000000000001';
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

describe('selectSyncedStandaloneViewFieldManifests', () => {
  it('syncs view fields on own views and keeps foreign view fields the app already owns', () => {
    const ownViewFieldManifest = buildViewFieldManifest({
      universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000001',
      viewUniversalIdentifier: OWN_VIEW_UNIVERSAL_IDENTIFIER,
    });
    const alreadySyncedForeignViewFieldManifest = buildViewFieldManifest({
      universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000002',
      viewUniversalIdentifier: FOREIGN_VIEW_UNIVERSAL_IDENTIFIER,
    });
    const newForeignViewFieldManifest = buildViewFieldManifest({
      universalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000003',
      viewUniversalIdentifier: FOREIGN_VIEW_UNIVERSAL_IDENTIFIER,
    });

    expect(
      selectSyncedStandaloneViewFieldManifests({
        manifest: {
          views: [{ universalIdentifier: OWN_VIEW_UNIVERSAL_IDENTIFIER }],
          viewFields: [
            ownViewFieldManifest,
            alreadySyncedForeignViewFieldManifest,
            newForeignViewFieldManifest,
          ],
        },
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        fromFlatViewFieldMaps: {
          byUniversalIdentifier: {
            [alreadySyncedForeignViewFieldManifest.universalIdentifier]: {},
          },
        },
      }),
    ).toEqual([ownViewFieldManifest, alreadySyncedForeignViewFieldManifest]);
  });
});
