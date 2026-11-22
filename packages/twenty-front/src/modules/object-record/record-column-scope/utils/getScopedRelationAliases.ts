import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { generateJunctionRelationGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateJunctionRelationGqlFields';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { getRelationScopeRecordFiltersAndSorts } from '@/object-record/record-column-scope/utils/getRelationScopeRecordFiltersAndSorts';
import { getScopedRelationColumn } from '@/object-record/record-column-scope/utils/getScopedRelationColumn';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
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
    | 'relationAggregateOperation'
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

    if (!isDefined(fieldMetadataItem) || !isDefined(relationScope)) {
      return [];
    }

    const scopedRelationColumn = getScopedRelationColumn({
      recordField,
      fieldMetadataItem,
      objectMetadataItems,
      isLookupColumnsEnabled,
    });

    if (!isDefined(scopedRelationColumn)) {
      return [];
    }

    const {
      relationObjectMetadataItem,
      lookupTarget,
      scopedRelationJunction,
      summary,
    } = scopedRelationColumn;

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

    const relationWithArguments: RecordGqlFieldsRelationWithArguments = {
      relationFieldName: fieldMetadataItem.name,
      filter,
      orderBy,
      first: relationScope.limit ?? undefined,
      // Selecting an aggregate of a field the user cannot read would fail the whole query
      ...(isDefined(summary) &&
        summary.isAggregatedFieldReadable && {
          aggregateGqlFieldNames: [summary.aggregateGqlFieldName],
        }),
      recordGqlFields: {
        ...(isDefined(summary)
          ? { id: true }
          : isDefined(scopedRelationJunction)
            ? generateJunctionRelationGqlFields({
                junctionConfig: scopedRelationJunction.junctionConfig,
                objectMetadataItems,
              })
            : buildIdentifierGqlFields(relationObjectMetadataItem)),
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
        summary,
        scopedRelationJunction,
      },
    ];
  });
