import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { getUnresolvableObjectReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unresolvable-object-reason.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

const VIEW_FIELD_REFERENCE_PROPERTIES = [
  'mainGroupByFieldMetadataUniversalIdentifier',
  'kanbanAggregateOperationFieldMetadataUniversalIdentifier',
  'calendarFieldMetadataUniversalIdentifier',
  'calendarEndFieldMetadataUniversalIdentifier',
] as const satisfies readonly (keyof FlatView)[];

export const getUnsupportedViewReason = ({
  flatView,
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
}: {
  flatView: FlatView;
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  exportedObjectUniversalIdentifiers: ReadonlySet<string>;
}): string | undefined => {
  if (!isNonEmptyString(flatView.name)) {
    return 'view without a name';
  }

  const unresolvableObjectReason = getUnresolvableObjectReason({
    metadataName: 'view',
    objectUniversalIdentifier: flatView.objectMetadataUniversalIdentifier,
    applicationAllFlatEntityMaps,
    allFlatEntityMaps,
    exportedObjectUniversalIdentifiers,
  });

  if (isDefined(unresolvableObjectReason)) {
    return unresolvableObjectReason;
  }

  const referencesMissingField = VIEW_FIELD_REFERENCE_PROPERTIES.some(
    (property) => {
      const fieldMetadataUniversalIdentifier = flatView[property];

      return (
        isDefined(fieldMetadataUniversalIdentifier) &&
        !isDefined(
          allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
            fieldMetadataUniversalIdentifier
          ],
        )
      );
    },
  );

  if (referencesMissingField) {
    return 'view referencing a field that does not exist';
  }

  return undefined;
};
