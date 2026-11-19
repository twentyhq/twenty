import { type StandaloneViewFieldManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { partitionStandaloneViewFieldManifests } from 'src/engine/core-modules/application/application-manifest/utils/partition-standalone-view-field-manifests.util';

export const selectSyncedStandaloneViewFieldManifests = ({
  manifest,
  applicationUniversalIdentifier,
  fromFlatViewFieldMaps,
}: {
  manifest: Parameters<
    typeof partitionStandaloneViewFieldManifests
  >[0]['manifest'];
  applicationUniversalIdentifier: string;
  fromFlatViewFieldMaps: {
    byUniversalIdentifier: Partial<Record<string, unknown>>;
  };
}): StandaloneViewFieldManifest[] => {
  const { ownViewFieldManifests, suggestedViewFieldManifests } =
    partitionStandaloneViewFieldManifests({
      manifest,
      applicationUniversalIdentifier,
    });

  // An earlier version synced these columns as app-owned: dropping them would delete the user's layout.
  const alreadySyncedSuggestedViewFieldManifests =
    suggestedViewFieldManifests.filter(({ universalIdentifier }) =>
      isDefined(
        fromFlatViewFieldMaps.byUniversalIdentifier[universalIdentifier],
      ),
    );

  return [
    ...ownViewFieldManifests,
    ...alreadySyncedSuggestedViewFieldManifests,
  ];
};
