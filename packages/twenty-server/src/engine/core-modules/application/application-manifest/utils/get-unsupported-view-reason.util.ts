import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

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
  applicationObjectUniversalIdentifiers,
  exportedObjectUniversalIdentifiers,
  allFlatEntityMaps,
}: {
  flatView: FlatView;
  applicationObjectUniversalIdentifiers: ReadonlySet<string>;
  exportedObjectUniversalIdentifiers: ReadonlySet<string>;
  allFlatEntityMaps: AllFlatEntityMaps;
}): string | undefined => {
  if (!isNonEmptyString(flatView.name)) {
    return 'view without a name';
  }

  const objectUniversalIdentifier = flatView.objectMetadataUniversalIdentifier;

  if (
    applicationObjectUniversalIdentifiers.has(objectUniversalIdentifier) &&
    !exportedObjectUniversalIdentifiers.has(objectUniversalIdentifier)
  ) {
    return 'view on an unsupported object';
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
