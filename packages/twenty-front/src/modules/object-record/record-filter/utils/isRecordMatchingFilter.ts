import { isObject } from '@sniptt/guards';

import {
  FieldMetadataType,
  type AndObjectRecordFilter,
  type ArrayFilter,
  type BooleanFilter,
  type CurrencyFilter,
  type DateFilter,
  type FieldReferenceFilter,
  type FilesFilter,
  type FloatFilter,
  type LeafObjectRecordFilter,
  type MultiSelectFilter,
  type NotObjectRecordFilter,
  type OrObjectRecordFilter,
  type RatingFilter,
  type RawJsonFilter,
  type RecordGqlOperationFilter,
  type RichTextFilter,
  type SelectFilter,
  type StringFilter,
  type TSVectorFilter,
  type UUIDFilter,
} from 'twenty-shared/types';
import {
  COMPOSITE_FIELD_SUB_FIELD_MATCHERS_MAP,
  computeRelationGqlFieldJoinColumnName,
  isDefined,
  isEmptyObject,
  isFieldReferenceFilterOperator,
  isMatchingArrayFilter,
  isMatchingBooleanFilter,
  isMatchingCompositeFilter,
  isMatchingCurrencyFilter,
  isMatchingDateFilter,
  isMatchingFilesFilter,
  isMatchingFloatFilter,
  isMatchingMultiSelectFilter,
  isMatchingRatingFilter,
  isMatchingRawJsonFilter,
  isMatchingRichTextFilter,
  isMatchingSelectFilter,
  isMatchingStringFilter,
  isMatchingTSVectorFilter,
  isMatchingUUIDFilter,
} from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { computePossibleMorphGqlFieldForFieldName } from '@/object-record/cache/utils/computePossibleMorphGqlFieldForFieldName';
import { isObjectRecordConnection } from '@/object-record/cache/utils/isObjectRecordConnection';
import { isMatchingFieldReferenceFilter } from '@/object-record/record-filter/utils/isMatchingFieldReferenceFilter';

const isLeafFilter = (
  filter: RecordGqlOperationFilter,
): filter is LeafObjectRecordFilter => {
  return !isAndFilter(filter) && !isOrFilter(filter) && !isNotFilter(filter);
};

const isAndFilter = (
  filter: RecordGqlOperationFilter,
): filter is AndObjectRecordFilter => 'and' in filter && !!filter.and;

const isImplicitAndFilter = (filter: RecordGqlOperationFilter) =>
  Object.keys(filter).length > 1;

const isMorphRelationJoinColumnKey = ({
  fieldMetadataItem,
  key,
}: {
  fieldMetadataItem: FieldMetadataItem;
  key: string;
}): boolean => {
  if (!fieldMetadataItem.morphRelations?.length) {
    return false;
  }

  const possibleJoinColumnNames = computePossibleMorphGqlFieldForFieldName({
    fieldMetadata: {
      morphRelations: fieldMetadataItem.morphRelations,
      fieldName: fieldMetadataItem.name,
    },
  }).map((name) => doNotTranslate(`${name}Id`));

  return possibleJoinColumnNames.includes(key);
};

const isOrFilter = (
  filter: RecordGqlOperationFilter,
): filter is OrObjectRecordFilter => 'or' in filter && !!filter.or;

const isNotFilter = (
  filter: RecordGqlOperationFilter,
): filter is NotObjectRecordFilter => 'not' in filter && !!filter.not;

const UUID_FILTER_OPERATOR_KEYS = new Set<string>([
  'eq',
  'gt',
  'gte',
  'in',
  'is',
  'lt',
  'lte',
  'neq',
]);

// Either UUID operators on the related id, or nested field filters from view filters traversing a relation.
const isNestedRelationFilter = (
  filterValue: unknown,
): filterValue is RecordGqlOperationFilter =>
  isObject(filterValue) &&
  Object.keys(filterValue).some((key) => !UUID_FILTER_OPERATOR_KEYS.has(key));

// Records fetched through a relation often carry { list: { id } } without listId.
const getJoinColumnValue = ({
  record,
  joinColumnName,
}: {
  record: Record<string, any>;
  joinColumnName: string;
}) => {
  if (record[joinColumnName] !== undefined) {
    return record[joinColumnName];
  }

  const relationRecord =
    record[joinColumnName.slice(0, -doNotTranslate('Id').length)];

  return isObject(relationRecord)
    ? (relationRecord.id ?? null)
    : relationRecord;
};

const isRecordMatchingNestedRelationFilter = ({
  relationRecord,
  nestedFilter,
  relationFieldMetadataItem,
  objectMetadataItems,
  isWithinNegatedFilter,
  parentRecord,
}: {
  relationRecord: unknown;
  nestedFilter: RecordGqlOperationFilter;
  relationFieldMetadataItem: Pick<FieldMetadataItem, 'relation'>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  isWithinNegatedFilter: boolean;
  parentRecord: Record<string, unknown>;
}): boolean => {
  // Null fails the nested predicate (backend NOT EXISTS); unloaded returns the negation parity to stay excluded.
  if (relationRecord === null) {
    return false;
  }

  if (!isObject(relationRecord)) {
    return isWithinNegatedFilter;
  }

  const relationTargetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id ===
      relationFieldMetadataItem.relation?.targetObjectMetadata.id,
  );

  if (!isDefined(relationTargetObjectMetadataItem)) {
    return isWithinNegatedFilter;
  }

  const isRecordMatchingNestedFilter = (record: unknown) =>
    isRecordMatchingFilter({
      record,
      filter: nestedFilter,
      objectMetadataItem: relationTargetObjectMetadataItem,
      objectMetadataItems,
      isWithinNegatedFilter,
      parentRecord,
    });

  // Matches when any loaded record does, like the backend EXISTS.
  return getLoadedRelationRecords({
    relationRecord,
    relationTargetObjectNameSingular:
      relationTargetObjectMetadataItem.nameSingular,
  }).some(
    (relatedRecord) =>
      isObject(relatedRecord) && isRecordMatchingNestedFilter(relatedRecord),
  );
};

// To-many values are an array (store) or a connection (GraphQL response).
const getLoadedRelationRecords = ({
  relationRecord,
  relationTargetObjectNameSingular,
}: {
  relationRecord: object;
  relationTargetObjectNameSingular: string;
}): unknown[] => {
  if (Array.isArray(relationRecord)) {
    return relationRecord;
  }

  if (
    isObjectRecordConnection(relationTargetObjectNameSingular, relationRecord)
  ) {
    return relationRecord.edges?.map((edge) => edge.node) ?? [];
  }

  return [relationRecord];
};

export const isRecordMatchingFilter = ({
  record,
  filter,
  objectMetadataItem,
  objectMetadataItems,
  isWithinNegatedFilter = false,
  parentRecord,
}: {
  record: any;
  filter: RecordGqlOperationFilter;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  isWithinNegatedFilter?: boolean;
  parentRecord?: Record<string, unknown>;
}): boolean => {
  if (Object.keys(filter).length === 0 && record.deletedAt === null) {
    return true;
  }

  if (isImplicitAndFilter(filter)) {
    return Object.entries(filter).every(([filterKey, value]) =>
      isRecordMatchingFilter({
        record,
        filter: { [filterKey]: value },
        objectMetadataItem,
        objectMetadataItems,
        isWithinNegatedFilter,
        parentRecord,
      }),
    );
  }

  if (isAndFilter(filter)) {
    const filterValue = filter.and;

    if (!Array.isArray(filterValue)) {
      throw new Error(
        doNotTranslate('Unexpected value for "and" filter : ') +
          JSON.stringify(filterValue),
      );
    }

    return (
      filterValue.length === 0 ||
      filterValue.every((andFilter) =>
        isRecordMatchingFilter({
          record,
          filter: andFilter,
          objectMetadataItem,
          objectMetadataItems,
          isWithinNegatedFilter,
          parentRecord,
        }),
      )
    );
  }

  if (isOrFilter(filter)) {
    const filterValue = filter.or;

    if (Array.isArray(filterValue)) {
      return (
        filterValue.length === 0 ||
        filterValue.some((orFilter) =>
          isRecordMatchingFilter({
            record,
            filter: orFilter,
            objectMetadataItem,
            objectMetadataItems,
            isWithinNegatedFilter,
            parentRecord,
          }),
        )
      );
    }

    if (isObject(filterValue)) {
      // The API considers "or" with an object as an "and"
      return isRecordMatchingFilter({
        record,
        filter: filterValue,
        objectMetadataItem,
        objectMetadataItems,
        isWithinNegatedFilter,
        parentRecord,
      });
    }

    throw new Error(
      doNotTranslate('Unexpected value for "or" filter : ') + filterValue,
    );
  }

  if (isNotFilter(filter)) {
    const filterValue = filter.not;

    if (!isDefined(filterValue)) {
      throw new Error(
        doNotTranslate('Unexpected value for "not" filter : ') + filterValue,
      );
    }

    return (
      isEmptyObject(filterValue) ||
      !isRecordMatchingFilter({
        record,
        filter: filterValue,
        objectMetadataItem,
        objectMetadataItems,
        isWithinNegatedFilter: !isWithinNegatedFilter,
        parentRecord,
      })
    );
  }

  if (isLeafFilter(filter)) {
    if (isDefined(record.deletedAt) && filter.deletedAt === undefined) {
      return false;
    }
  }

  return Object.entries(filter).every(([filterKey, filterValue]) => {
    if (!isDefined(filterValue)) {
      throw new Error(
        doNotTranslate('Unexpected value for filter key "') +
          filterKey +
          '" : ' +
          filterValue,
      );
    }

    if (isEmptyObject(filterValue)) return true;

    const objectMetadataField =
      objectMetadataItem.fields.find((field) => field.name === filterKey) ??
      objectMetadataItem.fields.find(
        (field) =>
          (field.type === FieldMetadataType.RELATION ||
            field.type === FieldMetadataType.MORPH_RELATION) &&
          computeRelationGqlFieldJoinColumnName({ name: field.name }) ===
            filterKey,
      ) ??
      objectMetadataItem.fields.find(
        (field) =>
          field.type === FieldMetadataType.MORPH_RELATION &&
          isMorphRelationJoinColumnKey({
            fieldMetadataItem: field,
            key: filterKey,
          }),
      );

    if (!isDefined(objectMetadataField)) {
      throw new Error(
        doNotTranslate('Field metadata item "') +
          filterKey +
          doNotTranslate('" not found for object metadata item ') +
          objectMetadataItem.nameSingular,
      );
    }

    const fieldReferenceOperator = Object.keys(filterValue).find(
      isFieldReferenceFilterOperator,
    );

    if (isDefined(fieldReferenceOperator)) {
      return isMatchingFieldReferenceFilter({
        value: record[filterKey],
        fieldType: objectMetadataField.type,
        operator: fieldReferenceOperator,
        fieldReferenceValue: (filterValue as FieldReferenceFilter)[
          fieldReferenceOperator
        ],
        record,
        parentRecord,
        isWithinNegatedFilter,
      });
    }

    const subFieldMatchers =
      COMPOSITE_FIELD_SUB_FIELD_MATCHERS_MAP[objectMetadataField.type];

    if (isDefined(subFieldMatchers)) {
      return isMatchingCompositeFilter({
        compositeFilter: filterValue,
        compositeValue: record[filterKey],
        subFieldMatchers,
      });
    }

    switch (objectMetadataField.type) {
      case FieldMetadataType.RATING:
        return isMatchingRatingFilter({
          ratingFilter: filterValue as RatingFilter,
          value: record[filterKey],
          options: objectMetadataField.options,
        });
      case FieldMetadataType.TEXT: {
        return isMatchingStringFilter({
          stringFilter: filterValue as StringFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.RICH_TEXT: {
        return isMatchingRichTextFilter({
          richTextFilter: filterValue as RichTextFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.SELECT:
        return isMatchingSelectFilter({
          selectFilter: filterValue as SelectFilter,
          value: record[filterKey],
          options: objectMetadataField.options,
        });
      case FieldMetadataType.MULTI_SELECT:
        return isMatchingMultiSelectFilter({
          multiSelectFilter: filterValue as MultiSelectFilter,
          value: record[filterKey],
        });
      case FieldMetadataType.ARRAY: {
        return isMatchingArrayFilter({
          arrayFilter: filterValue as ArrayFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.RAW_JSON: {
        return isMatchingRawJsonFilter({
          rawJsonFilter: filterValue as RawJsonFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.FILES: {
        return isMatchingFilesFilter({
          filesFilter: filterValue as FilesFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.DATE:
      case FieldMetadataType.DATE_TIME: {
        return isMatchingDateFilter({
          dateFilter: filterValue as DateFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
      case FieldMetadataType.POSITION: {
        return isMatchingFloatFilter({
          floatFilter: filterValue as FloatFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.UUID: {
        return isMatchingUUIDFilter({
          uuidFilter: filterValue as UUIDFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.BOOLEAN: {
        return isMatchingBooleanFilter({
          booleanFilter: filterValue as BooleanFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.CURRENCY: {
        return isMatchingCurrencyFilter({
          currencyFilter: filterValue as CurrencyFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.RELATION:
      case FieldMetadataType.MORPH_RELATION: {
        const isJoinColumn =
          computeRelationGqlFieldJoinColumnName({
            name: objectMetadataField.name,
          }) === filterKey ||
          (objectMetadataField.type === FieldMetadataType.MORPH_RELATION &&
            isMorphRelationJoinColumnKey({
              fieldMetadataItem: objectMetadataField,
              key: filterKey,
            }));

        if (isJoinColumn) {
          return isMatchingUUIDFilter({
            uuidFilter: filterValue as UUIDFilter,
            value: getJoinColumnValue({ record, joinColumnName: filterKey }),
          });
        }

        if (
          objectMetadataField.type === FieldMetadataType.RELATION &&
          isNestedRelationFilter(filterValue)
        ) {
          return isRecordMatchingNestedRelationFilter({
            relationRecord: record[filterKey],
            nestedFilter: filterValue,
            relationFieldMetadataItem: objectMetadataField,
            objectMetadataItems,
            isWithinNegatedFilter,
            parentRecord: record,
          });
        }

        return isMatchingUUIDFilter({
          uuidFilter: filterValue as UUIDFilter,
          value: record[filterKey]?.id ?? null,
        });
      }
      case FieldMetadataType.TS_VECTOR: {
        return isMatchingTSVectorFilter({
          tsVectorFilter: filterValue as TSVectorFilter,
          value: record[filterKey],
        });
      }
      default: {
        throw new Error(
          doNotTranslate(
            `Not implemented yet for field type "${objectMetadataField.type}"`,
          ),
        );
      }
    }
  });
};
