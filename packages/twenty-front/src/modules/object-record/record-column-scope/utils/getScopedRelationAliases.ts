import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { getRelationScopeRecordFiltersAndSorts } from '@/object-record/record-column-scope/utils/getRelationScopeRecordFiltersAndSorts';
import { getScopedRelationLookupTarget } from '@/object-record/record-column-scope/utils/getScopedRelationLookupTarget';
import { isScopedRelationColumn } from '@/object-record/record-column-scope/utils/isScopedRelationColumn';
import { resolveScopedRelationJunction } from '@/object-record/record-column-scope/utils/resolveScopedRelationJunction';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { getQueryVariablesFromFiltersAndSorts } from '@/views/utils/getQueryVariablesFromFiltersAndSorts';
import { type RecordFilterValueDependencies } from 'twenty-shared/types';
import {
  computeRelationGqlFieldJoinColumnName,
  computeRelationWithArgumentsResponseKey,
  isDefined,
} from 'twenty-shared/utils';

export const getScopedRelationAliases = ({
  recordFields,
  fieldMetadataItemByFieldMetadataItemId,
  objectMetadataItems,
  fieldMetadataItems,
  filterValueDependencies,
  isLookupColumnsEnabled,
}: {
  recordFields: Pick<
    RecordField,
    | 'id'
    | 'fieldMetadataItemId'
    | 'isCanonical'
    | 'relationScope'
    | 'relationTargetFieldMetadataId'
  >[];
  fieldMetadataItemByFieldMetadataItemId: Record<string, FieldMetadataItem>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  // Fields of every object: a scope filter can reach a field of a record related to the related records
  fieldMetadataItems: FieldMetadataItem[];
  filterValueDependencies: RecordFilterValueDependencies;
  isLookupColumnsEnabled: boolean;
}): ScopedRelationAlias[] =>
  recordFields.flatMap((recordField) => {
    const fieldMetadataItem =
      fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];
    const { relationScope } = recordField;

    if (
      !isDefined(fieldMetadataItem) ||
      !isDefined(relationScope) ||
      !isScopedRelationColumn({
        fieldMetadataItem,
        recordField,
        objectMetadataItems,
        isLookupColumnsEnabled,
      })
    ) {
      return [];
    }

    const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
      fieldMetadataItem,
      objectMetadataItems,
    });

    const relationTargetFieldName =
      fieldMetadataItem.relation?.targetFieldMetadata.name;

    if (
      !isDefined(relationObjectMetadataItem) ||
      !isDefined(relationTargetFieldName)
    ) {
      return [];
    }

    const { filter, orderBy } = getQueryVariablesFromFiltersAndSorts({
      ...getRelationScopeRecordFiltersAndSorts({
        relationScope,
        fieldMetadataItems,
      }),
      objectMetadataItem: relationObjectMetadataItem,
      objectMetadataItems,
      fieldMetadataItems,
      filterValueDependencies,
    });

    const first = relationScope.limit ?? undefined;

    return [
      {
        recordFieldId: recordField.id,
        responseKey: computeRelationWithArgumentsResponseKey({
          relationFieldName: fieldMetadataItem.name,
          filter,
          orderBy,
          first,
        }),
        relationFieldName: fieldMetadataItem.name,
        relationObjectMetadataItem,
        relationJoinColumnName: computeRelationGqlFieldJoinColumnName({
          name: relationTargetFieldName,
        }),
        filter,
        orderBy,
        first,
        lookupTarget: getScopedRelationLookupTarget({
          recordField,
          fieldMetadataItem,
          objectMetadataItems,
          isLookupColumnsEnabled,
        }),
        scopedRelationJunction: resolveScopedRelationJunction({
          fieldMetadataItem,
          objectMetadataItems,
        }).scopedRelationJunction,
      },
    ];
  });
