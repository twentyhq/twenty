import { isDefined } from 'twenty-shared/utils';

import { type RowsEstimationContext } from 'src/engine/api/common/common-query-runners/types/rows-estimation-context.type';
import { getApproximateRecordCount } from 'src/engine/api/common/common-query-runners/utils/get-approximate-record-count.util';
import { resolveFilterKeyFieldMetadata } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/resolve-filter-key-field-metadata.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const estimateJoinedRowCount = ({
  fieldNames,
  context,
}: {
  fieldNames: string[];
  context: RowsEstimationContext;
}): number => {
  const joinedRelationTargetIdByFieldId = new Map<string, string>();

  for (const fieldName of fieldNames) {
    const { fieldMetadata, isReferencedByFieldName } =
      resolveFilterKeyFieldMetadata({
        filterKey: fieldName,
        fieldIdByName: context.fieldIdByName,
        fieldIdByJoinColumnName: context.fieldIdByJoinColumnName,
        flatFieldMetadataMaps: context.flatFieldMetadataMaps,
      });

    if (
      isDefined(fieldMetadata) &&
      isReferencedByFieldName &&
      isMorphOrRelationFlatFieldMetadata(fieldMetadata)
    ) {
      joinedRelationTargetIdByFieldId.set(
        fieldMetadata.id,
        fieldMetadata.relationTargetObjectMetadataId,
      );
    }
  }

  return [...joinedRelationTargetIdByFieldId.values()].reduce(
    (joinedRowCount, relationTargetObjectMetadataId) =>
      joinedRowCount +
      getApproximateRecordCount(
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: relationTargetObjectMetadataId,
          flatEntityMaps: context.flatObjectMetadataMaps,
        }),
        context.approximateRecordCountByTableName,
      ),
    0,
  );
};
