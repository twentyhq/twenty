import { type ViewFilterManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatViewFilter } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter.type';

export const fromFlatViewFilterToViewFilterManifest = ({
  flatViewFilter,
}: {
  flatViewFilter: UniversalFlatViewFilter;
}): ViewFilterManifest => ({
  universalIdentifier: flatViewFilter.universalIdentifier,
  fieldMetadataUniversalIdentifier:
    flatViewFilter.fieldMetadataUniversalIdentifier,
  operand: flatViewFilter.operand,
  value: flatViewFilter.value,
  ...(isDefined(flatViewFilter.subFieldName)
    ? { subFieldName: flatViewFilter.subFieldName }
    : {}),
  ...(isDefined(flatViewFilter.relationTargetFieldMetadataUniversalIdentifier)
    ? {
        relationTargetFieldMetadataUniversalIdentifier:
          flatViewFilter.relationTargetFieldMetadataUniversalIdentifier,
      }
    : {}),
  ...(isDefined(flatViewFilter.viewFilterGroupUniversalIdentifier)
    ? {
        viewFilterGroupUniversalIdentifier:
          flatViewFilter.viewFilterGroupUniversalIdentifier,
      }
    : {}),
  ...(isDefined(flatViewFilter.positionInViewFilterGroup)
    ? { positionInViewFilterGroup: flatViewFilter.positionInViewFilterGroup }
    : {}),
});
