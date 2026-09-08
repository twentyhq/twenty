import { isDefined } from 'twenty-shared/utils';

import { getUnresolvableFieldReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unresolvable-field-reason.util';
import {
  isViewFilterValueNestedTooDeep,
  MAX_VIEW_FILTER_VALUE_DEPTH,
} from 'src/engine/core-modules/application/application-manifest/utils/is-view-filter-value-nested-too-deep.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

export const getUnsupportedViewFilterReason = ({
  flatViewFilter,
  allFlatEntityMaps,
}: {
  flatViewFilter: FlatViewFilter;
  allFlatEntityMaps: AllFlatEntityMaps;
}): string | undefined => {
  if (isViewFilterValueNestedTooDeep(flatViewFilter.value)) {
    return `view filter with a value nested deeper than ${MAX_VIEW_FILTER_VALUE_DEPTH} levels`;
  }

  const unresolvableFieldReason = getUnresolvableFieldReason({
    metadataName: 'viewFilter',
    fieldMetadataUniversalIdentifier:
      flatViewFilter.fieldMetadataUniversalIdentifier,
    allFlatEntityMaps,
  });

  if (isDefined(unresolvableFieldReason)) {
    return unresolvableFieldReason;
  }

  const relationTargetFieldMetadataUniversalIdentifier =
    flatViewFilter.relationTargetFieldMetadataUniversalIdentifier;

  return isDefined(relationTargetFieldMetadataUniversalIdentifier) &&
    !isDefined(
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        relationTargetFieldMetadataUniversalIdentifier
      ],
    )
    ? 'view filter on a relation target field that does not exist'
    : undefined;
};
