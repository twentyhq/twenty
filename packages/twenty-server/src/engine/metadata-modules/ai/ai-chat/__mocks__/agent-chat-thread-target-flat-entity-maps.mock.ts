import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const {
  allFlatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
} = computeTwentyStandardApplicationAllFlatEntityMaps({
  now: '2026-09-24T00:00:00.000Z',
  workspaceId: '20202020-1111-4111-8111-111111111111',
  twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
});

const fieldIdsByObjectMetadataId = new Map<string, string[]>();

for (const flatFieldMetadata of Object.values(
  flatFieldMetadataMaps.byUniversalIdentifier,
).filter(isDefined)) {
  fieldIdsByObjectMetadataId.set(flatFieldMetadata.objectMetadataId, [
    ...(fieldIdsByObjectMetadataId.get(flatFieldMetadata.objectMetadataId) ??
      []),
    flatFieldMetadata.id,
  ]);
}

// The standard application computes its objects with empty fieldIds, which the
// workspace cache fills in, and the target's legs are found through them.
export const AGENT_CHAT_THREAD_TARGET_FLAT_ENTITY_MAPS_MOCK: Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
> = {
  flatObjectMetadataMaps: {
    ...flatObjectMetadataMaps,
    byUniversalIdentifier: Object.fromEntries(
      Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map((flatObjectMetadata) => [
          flatObjectMetadata.universalIdentifier,
          {
            ...flatObjectMetadata,
            fieldIds:
              fieldIdsByObjectMetadataId.get(flatObjectMetadata.id) ?? [],
          },
        ]),
    ),
  },
  flatFieldMetadataMaps,
};
