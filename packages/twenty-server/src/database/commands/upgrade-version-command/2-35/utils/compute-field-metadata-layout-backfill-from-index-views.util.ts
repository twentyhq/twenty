import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

export const computeFieldMetadataLayoutBackfillFromIndexViews = ({
  flatViewMaps,
  flatViewFieldMaps,
  flatFieldMetadataMaps,
  now,
}: {
  flatViewMaps: FlatEntityMaps<FlatView>;
  flatViewFieldMaps: FlatEntityMaps<FlatViewField>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  now: string;
}): { flatFieldMetadatasToUpdate: FlatFieldMetadata[] } => {
  const indexViewIds = new Set(
    Object.values(flatViewMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (flatView) =>
          flatView.key === ViewKey.INDEX && !isDefined(flatView.deletedAt),
      )
      .map((flatView) => flatView.id),
  );

  const flatFieldMetadatasToUpdate: FlatFieldMetadata[] = [];

  for (const flatViewField of Object.values(
    flatViewFieldMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (
      !indexViewIds.has(flatViewField.viewId) ||
      isDefined(flatViewField.deletedAt)
    ) {
      continue;
    }

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatViewField.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      continue;
    }

    if (isDefined(flatFieldMetadata.position)) {
      continue;
    }

    flatFieldMetadatasToUpdate.push({
      ...flatFieldMetadata,
      position: flatViewField.position,
      isVisibleByDefault: flatViewField.isVisible,
      updatedAt: now,
    });
  }

  return { flatFieldMetadatasToUpdate };
};
