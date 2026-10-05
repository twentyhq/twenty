import { RelationType } from 'twenty-shared/types';

import { type RowsEstimationContext } from 'src/engine/api/common/common-query-runners/types/rows-estimation-context.type';
import { getApproximateRecordCount } from 'src/engine/api/common/common-query-runners/utils/get-approximate-record-count.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const estimateChildRowCount = ({
  parentRowCount,
  context,
}: {
  parentRowCount: number;
  context: RowsEstimationContext;
}): number =>
  getFlatFieldsFromFlatObjectMetadata(
    context.flatObjectMetadata,
    context.flatFieldMetadataMaps,
  )
    .filter(isMorphOrRelationFlatFieldMetadata)
    .filter(
      (relationField) =>
        relationField.settings.relationType === RelationType.ONE_TO_MANY,
    )
    .reduce((childRowCount, relationField) => {
      const targetFlatObjectMetadata =
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: relationField.relationTargetObjectMetadataId,
          flatEntityMaps: context.flatObjectMetadataMaps,
        });

      return (
        childRowCount +
        parentRowCount *
          Math.ceil(
            getApproximateRecordCount(
              targetFlatObjectMetadata,
              context.approximateRecordCountByTableName,
            ) / (context.recordCount || 1),
          )
      );
    }, 0);
