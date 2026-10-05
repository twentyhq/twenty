import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RowsEstimationContext } from 'src/engine/api/common/common-query-runners/types/rows-estimation-context.type';
import { getApproximateRecordCount } from 'src/engine/api/common/common-query-runners/utils/get-approximate-record-count.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const estimateRelationRowsRead = ({
  select,
  parentRowCount,
  context,
  flatObjectMetadata = context.flatObjectMetadata,
  recordLimitPerParent = QUERY_MAX_RECORDS_FROM_RELATION,
}: {
  select: CommonSelectedFields;
  parentRowCount: number;
  context: RowsEstimationContext;
  flatObjectMetadata?: FlatObjectMetadata;
  recordLimitPerParent?: number;
}): number => {
  const parentRecordCount = getApproximateRecordCount(
    flatObjectMetadata,
    context.approximateRecordCountByTableName,
  );

  return getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    context.flatFieldMetadataMaps,
  )
    .filter(isMorphOrRelationFlatFieldMetadata)
    .filter((relationField) => isDefined(select[relationField.name]))
    .reduce((rowsRead, relationField) => {
      const targetFlatObjectMetadata =
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: relationField.relationTargetObjectMetadataId,
          flatEntityMaps: context.flatObjectMetadataMaps,
        });

      const childRowsPerParent =
        relationField.settings.relationType === RelationType.ONE_TO_MANY
          ? Math.min(
              recordLimitPerParent,
              Math.ceil(
                getApproximateRecordCount(
                  targetFlatObjectMetadata,
                  context.approximateRecordCountByTableName,
                ) / (parentRecordCount || 1),
              ),
            )
          : 1;

      const childRowCount = parentRowCount * childRowsPerParent;

      return (
        rowsRead +
        childRowCount +
        estimateRelationRowsRead({
          select: select[relationField.name] as CommonSelectedFields,
          parentRowCount: childRowCount,
          context,
          flatObjectMetadata: targetFlatObjectMetadata,
          recordLimitPerParent,
        })
      );
    }, 0);
};
