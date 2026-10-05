import { compositeTypeDefinitions, IndexType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type IndexedColumn } from 'src/engine/api/common/common-query-runners/types/indexed-column.type';
import { type RowsEstimationContext } from 'src/engine/api/common/common-query-runners/types/rows-estimation-context.type';
import { getApproximateRecordCount } from 'src/engine/api/common/common-query-runners/utils/get-approximate-record-count.util';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import {
  type FlatIndexFieldMetadata,
  type FlatIndexMetadata,
} from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const computeIndexFieldColumns = (
  flatIndexFieldMetadata: FlatIndexFieldMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
): { name: string; relationTargetObjectMetadataId: string | null }[] => {
  const flatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: flatIndexFieldMetadata.fieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
    return [
      {
        name: computeMorphOrRelationFieldJoinColumnName({
          name: flatFieldMetadata.name,
        }),
        relationTargetObjectMetadataId:
          flatFieldMetadata.relationTargetObjectMetadataId,
      },
    ];
  }

  if (!isCompositeFieldMetadataType(flatFieldMetadata.type)) {
    return [
      { name: flatFieldMetadata.name, relationTargetObjectMetadataId: null },
    ];
  }

  return (
    compositeTypeDefinitions.get(flatFieldMetadata.type)?.properties ?? []
  )
    .filter((property) =>
      isDefined(flatIndexFieldMetadata.subFieldName)
        ? property.name === flatIndexFieldMetadata.subFieldName
        : property.isIncludedInUniqueConstraint,
    )
    .map((property) => ({
      name: computeCompositeColumnName(flatFieldMetadata, property),
      relationTargetObjectMetadataId: null,
    }));
};

const buildIndexedColumnByName = (
  flatObjectMetadata: FlatObjectMetadata,
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
): Map<string, IndexedColumn> => {
  const indexedColumnByName = new Map<string, IndexedColumn>([
    ['id', { isUnique: true, relationTargetObjectMetadataId: null }],
  ]);

  const fullBtreeIndexes = findManyFlatEntityByIdInFlatEntityMaps({
    flatEntityIds: flatObjectMetadata.indexMetadataIds,
    flatEntityMaps: flatIndexMaps,
  }).filter(
    (flatIndexMetadata) =>
      flatIndexMetadata.indexType === IndexType.BTREE &&
      !isDefined(flatIndexMetadata.indexWhereClause),
  );

  for (const flatIndexMetadata of fullBtreeIndexes) {
    const indexColumns = [...flatIndexMetadata.flatIndexFieldMetadatas]
      .sort((a, b) => a.order - b.order)
      .flatMap((flatIndexFieldMetadata) =>
        computeIndexFieldColumns(flatIndexFieldMetadata, flatFieldMetadataMaps),
      );

    const [leadingColumn] = indexColumns;

    if (!isDefined(leadingColumn)) {
      continue;
    }

    const isSingleColumnUniqueIndex =
      flatIndexMetadata.isUnique && indexColumns.length === 1;

    indexedColumnByName.set(leadingColumn.name, {
      isUnique:
        isSingleColumnUniqueIndex ||
        (indexedColumnByName.get(leadingColumn.name)?.isUnique ?? false),
      relationTargetObjectMetadataId:
        leadingColumn.relationTargetObjectMetadataId,
    });
  }

  return indexedColumnByName;
};

export const buildRowsEstimationContext = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatIndexMaps,
  approximateRecordCountByTableName,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  approximateRecordCountByTableName: Map<string, number>;
}): RowsEstimationContext => {
  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

  return {
    flatObjectMetadata,
    recordCount: getApproximateRecordCount(
      flatObjectMetadata,
      approximateRecordCountByTableName,
    ),
    indexedColumnByName: buildIndexedColumnByName(
      flatObjectMetadata,
      flatIndexMaps,
      flatFieldMetadataMaps,
    ),
    fieldIdByName,
    fieldIdByJoinColumnName,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    approximateRecordCountByTableName,
  };
};
