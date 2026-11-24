import { isDynamicField } from 'src/engine/metadata-modules/field-metadata/utils/is-dynamic-field.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type DynamicFieldFilter } from 'src/engine/api/common/common-dynamic-fields/types/dynamic-field-filter.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type MapDynamicFieldFiltersArgs = {
  filter: ObjectRecordFilter;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  mapDynamicFieldFilter: (
    dynamicFieldFilter: DynamicFieldFilter,
  ) => ObjectRecordFilter | undefined;
};

const resolveFilterKey = ({
  filterKey,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: Pick<
  MapDynamicFieldFiltersArgs,
  'flatObjectMetadata' | 'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
> & { filterKey: string }): {
  isDynamic: boolean;
  columnName: string;
  relationTargetFlatObjectMetadata: FlatObjectMetadata | undefined;
} => {
  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );
  const isJoinColumn = isDefined(fieldIdByJoinColumnName[filterKey]);
  const fieldMetadataId = isJoinColumn
    ? fieldIdByJoinColumnName[filterKey]
    : fieldIdByName[filterKey];
  const fieldMetadata = isDefined(fieldMetadataId)
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;

  if (!isDefined(fieldMetadata)) {
    return {
      isDynamic: false,
      columnName: filterKey,
      relationTargetFlatObjectMetadata: undefined,
    };
  }

  const isRelationReferencedByName =
    !isJoinColumn &&
    isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION) &&
    isDefined(fieldMetadata.relationTargetObjectMetadataId);

  return {
    isDynamic: isDynamicField(fieldMetadata),
    columnName: isRelationReferencedByName
      ? computeMorphOrRelationFieldJoinColumnName({ name: filterKey })
      : filterKey,
    relationTargetFlatObjectMetadata: isRelationReferencedByName
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        })
      : undefined,
  };
};

export const mapDynamicFieldFilters = ({
  filter,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  mapDynamicFieldFilter,
}: MapDynamicFieldFiltersArgs): ObjectRecordFilter => {
  const mapNestedFilter = ({
    nestedFilter,
    nestedFlatObjectMetadata = flatObjectMetadata,
  }: {
    nestedFilter: ObjectRecordFilter;
    nestedFlatObjectMetadata?: FlatObjectMetadata;
  }) =>
    mapDynamicFieldFilters({
      filter: nestedFilter,
      flatObjectMetadata: nestedFlatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      mapDynamicFieldFilter,
    });

  const untouchedFilter: ObjectRecordFilter = {};
  const mappedDynamicFieldFilters: ObjectRecordFilter[] = [];

  for (const [key, value] of Object.entries(filter)) {
    if ((key === 'and' || key === 'or') && Array.isArray(value)) {
      untouchedFilter[key] = value.map((nestedFilter) =>
        mapNestedFilter({ nestedFilter }),
      );
      continue;
    }

    if (key === 'not' && isPlainObject(value)) {
      untouchedFilter[key] = mapNestedFilter({ nestedFilter: value });
      continue;
    }

    if (!isPlainObject(value)) {
      untouchedFilter[key] = value;
      continue;
    }

    const { isDynamic, columnName, relationTargetFlatObjectMetadata } =
      resolveFilterKey({
        filterKey: key,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

    if (isDynamic) {
      const mappedDynamicFieldFilter = mapDynamicFieldFilter({
        flatObjectMetadata,
        dynamicFieldName: columnName,
        dynamicFieldFilter: value,
        relationTargetFlatObjectMetadata,
      });

      if (isDefined(mappedDynamicFieldFilter)) {
        mappedDynamicFieldFilters.push(mappedDynamicFieldFilter);
        continue;
      }
    }

    untouchedFilter[key] = isDefined(relationTargetFlatObjectMetadata)
      ? mapNestedFilter({
          nestedFilter: value,
          nestedFlatObjectMetadata: relationTargetFlatObjectMetadata,
        })
      : value;
  }

  if (mappedDynamicFieldFilters.length === 0) {
    return untouchedFilter;
  }

  return {
    and: [
      ...(Object.keys(untouchedFilter).length > 0 ? [untouchedFilter] : []),
      ...mappedDynamicFieldFilters,
    ],
  };
};
