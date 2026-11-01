import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

const computeViewFilterKey = ({
  viewId,
  viewFilterGroupId,
  fieldMetadataId,
  relationTargetFieldMetadataId,
  subFieldName,
  operand,
  value,
}: Pick<
  FlatViewFilter,
  | 'viewId'
  | 'viewFilterGroupId'
  | 'fieldMetadataId'
  | 'relationTargetFieldMetadataId'
  | 'subFieldName'
  | 'operand'
  | 'value'
>) =>
  JSON.stringify([
    viewId,
    viewFilterGroupId,
    fieldMetadataId,
    relationTargetFieldMetadataId,
    subFieldName,
    operand,
    value,
  ]);

export const buildMorphRelationHeadViewFilterCopies = ({
  headByRepresentativeId,
  workspaceCustomApplicationUniversalIdentifier,
  flatViewFilterMaps,
}: {
  headByRepresentativeId: Map<string, FlatFieldMetadata>;
  workspaceCustomApplicationUniversalIdentifier: string;
  flatViewFilterMaps: FlatEntityMaps<FlatViewFilter>;
}): FlatViewFilter[] => {
  const viewFilters = Object.values(flatViewFilterMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((viewFilter) => !isDefined(viewFilter.deletedAt));
  const viewFilterKeys = new Set(viewFilters.map(computeViewFilterKey));

  return viewFilters.flatMap((viewFilter) => {
    const fieldHead = headByRepresentativeId.get(viewFilter.fieldMetadataId);
    const relationTargetHead = isDefined(
      viewFilter.relationTargetFieldMetadataId,
    )
      ? headByRepresentativeId.get(viewFilter.relationTargetFieldMetadataId)
      : undefined;

    if (!isDefined(fieldHead) && !isDefined(relationTargetHead)) {
      return [];
    }

    const copy = {
      ...viewFilter,
      id: v4(),
      universalIdentifier: v4(),
      applicationUniversalIdentifier:
        workspaceCustomApplicationUniversalIdentifier,
      ...(isDefined(fieldHead) && {
        fieldMetadataId: fieldHead.id,
        fieldMetadataUniversalIdentifier: fieldHead.universalIdentifier,
      }),
      ...(isDefined(relationTargetHead) && {
        relationTargetFieldMetadataId: relationTargetHead.id,
        relationTargetFieldMetadataUniversalIdentifier:
          relationTargetHead.universalIdentifier,
      }),
    };
    const copyKey = computeViewFilterKey(copy);

    if (viewFilterKeys.has(copyKey)) {
      return [];
    }

    viewFilterKeys.add(copyKey);

    return [copy];
  });
};
