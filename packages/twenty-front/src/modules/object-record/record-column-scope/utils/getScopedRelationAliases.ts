import { TOTAL_COUNT_GQL_FIELD_NAME } from '@/object-record/constants/TotalCountGqlFieldName';
import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { generateJunctionRelationGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateJunctionRelationGqlFields';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { isLookupTargetFieldReadable } from '@/object-record/record-column-lookup/utils/isLookupTargetFieldReadable';
import { getRelationScopeReachedFields } from '@/object-record/record-column-scope/utils/getRelationScopeReachedFields';
import { getRelationScopeRecordFiltersAndSorts } from '@/object-record/record-column-scope/utils/getRelationScopeRecordFiltersAndSorts';
import { getScopedRelationColumn } from '@/object-record/record-column-scope/utils/getScopedRelationColumn';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getQueryVariablesFromFiltersAndSorts } from '@/views/utils/getQueryVariablesFromFiltersAndSorts';
import {
  type RecordFilterValueDependencies,
  type RecordGqlFields,
  type RecordGqlFieldsRelationWithArguments,
} from 'twenty-shared/types';
import {
  computeRelationWithArgumentsResponseKey,
  findById,
  isDefined,
} from 'twenty-shared/utils';

const getRelatedRecordGqlFields = ({
  scopedRelationColumn: {
    relationObjectMetadataItem,
    scopedRelationJunction,
    summary,
  },
  objectMetadataItems,
}: {
  scopedRelationColumn: Pick<
    ScopedRelationAlias,
    'relationObjectMetadataItem' | 'scopedRelationJunction' | 'summary'
  >;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): RecordGqlFields => {
  // A summary reads its aggregate, so it only needs the ids of the related records
  if (isDefined(summary)) {
    return { id: true };
  }

  if (isDefined(scopedRelationJunction)) {
    return generateJunctionRelationGqlFields({
      junctionConfig: scopedRelationJunction.junctionConfig,
      objectMetadataItems,
    });
  }

  return buildIdentifierGqlFields(relationObjectMetadataItem);
};

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
      // A summary only reads its aggregate; a first of 0 would lift the server's cap instead
      first: isDefined(summary) ? 1 : (relationScope.limit ?? undefined),
      // The server caps the related records even without a limit, so the count of the left out ones is always needed
      aggregateGqlFieldNames: [
        ...new Set([
          TOTAL_COUNT_GQL_FIELD_NAME,
          ...(isDefined(summary) ? [summary.aggregateGqlFieldName] : []),
        ]),
      ],
      recordGqlFields: {
        ...getRelatedRecordGqlFields({
          scopedRelationColumn,
          objectMetadataItems,
        }),
        ...(isDefined(lookupTarget) && {
          [lookupTarget.lookupTargetFieldMetadataItem.name]: true,
        }),
      },
    };

    const reachedFields = getRelationScopeReachedFields({
      relationScope,
      relationObjectMetadataItem,
      objectMetadataItems,
    });

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
        reachedObjectMetadataItemIds: [
          ...new Set([
            relationObjectMetadataItem.id,
            // A join object column also lists its target records, which carry no reference to the rows showing them
            ...(isDefined(scopedRelationJunction)
              ? [scopedRelationJunction.targetObjectMetadataItem.id]
              : []),
            ...reachedFields.flatMap(({ objectMetadataItem }) =>
              isDefined(objectMetadataItem) ? [objectMetadataItem.id] : [],
            ),
          ]),
        ],
        isRestricted:
          scopedRelationColumn.isRestricted ||
          (isDefined(lookupTarget) &&
            !isLookupTargetFieldReadable(lookupTarget)) ||
          !reachedFields.every(
            ({ objectMetadataItem, fieldMetadataId }) =>
              objectMetadataItem?.readableFields.some(
                findById(fieldMetadataId),
              ) ?? false,
          ),
      },
    ];
  });
