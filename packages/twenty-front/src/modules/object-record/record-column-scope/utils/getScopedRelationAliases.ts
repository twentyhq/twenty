import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { getScopedRelationLookupTarget } from '@/object-record/record-column-scope/utils/getScopedRelationLookupTarget';
import { getRelationScopeRecordFiltersAndSorts } from '@/object-record/record-column-scope/utils/getRelationScopeRecordFiltersAndSorts';
import { isScopedRelationColumn } from '@/object-record/record-column-scope/utils/isScopedRelationColumn';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { getQueryVariablesFromFiltersAndSorts } from '@/views/utils/getQueryVariablesFromFiltersAndSorts';
import {
  type RecordFilterValueDependencies,
  type RecordGqlFieldsRelationWithArguments,
} from 'twenty-shared/types';
import {
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
        isLookupColumnsEnabled,
      })
    ) {
      return [];
    }

    const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
      fieldMetadataItem,
      objectMetadataItems,
    });

    if (!isDefined(relationObjectMetadataItem)) {
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

    const lookupTarget = getScopedRelationLookupTarget({
      recordField,
      fieldMetadataItem,
      objectMetadataItems,
      isLookupColumnsEnabled,
    });

    const relationWithArguments: RecordGqlFieldsRelationWithArguments = {
      relationFieldName: fieldMetadataItem.name,
      filter,
      orderBy,
      first: relationScope.limit ?? undefined,
      recordGqlFields: {
        ...buildIdentifierGqlFields(relationObjectMetadataItem),
        ...(isDefined(lookupTarget) && {
          [lookupTarget.lookupTargetFieldMetadataItem.name]: true,
        }),
      },
    };

    return [
      {
        recordFieldId: recordField.id,
        responseKey: computeRelationWithArgumentsResponseKey(
          relationWithArguments,
        ),
        relationObjectMetadataItem,
        relationWithArguments,
        lookupTarget,
      },
    ];
  });
