import { isObject } from '@sniptt/guards';

import {
  FieldMetadataType,
  type ActorFilter,
  type AddressFilter,
  type AndObjectRecordFilter,
  type ArrayFilter,
  type BooleanFilter,
  type CurrencyFilter,
  type DateFilter,
  type EmailsFilter,
  type FilesFilter,
  type FloatFilter,
  type FullNameFilter,
  type LeafObjectRecordFilter,
  type LinksFilter,
  type MultiSelectFilter,
  type NotObjectRecordFilter,
  type OrObjectRecordFilter,
  type PhonesFilter,
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
  computeRelationGqlFieldJoinColumnName,
  isDefined,
  isEmptyObject,
  isMatchingArrayFilter,
  isMatchingBooleanFilter,
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

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { computePossibleMorphGqlFieldForFieldName } from '@/object-record/cache/utils/computePossibleMorphGqlFieldForFieldName';

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
  }).map((name) => `${name}Id`);

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

// A filter on a relation field name either holds UUID operators applied to
// the related record id, or field names of the related record to match
// against the related record itself, like { person: { companyId: { in: [...] } } }
// produced by view filters traversing a relation.
const isNestedRelationFilter = (
  filterValue: unknown,
): filterValue is RecordGqlOperationFilter =>
  isObject(filterValue) &&
  Object.keys(filterValue).some((key) => !UUID_FILTER_OPERATOR_KEYS.has(key));

const isRecordMatchingNestedRelationFilter = ({
  relationRecord,
  nestedFilter,
  relationFieldMetadataItem,
  objectMetadataItems,
  isWithinNegatedFilter,
}: {
  relationRecord: unknown;
  nestedFilter: RecordGqlOperationFilter;
  relationFieldMetadataItem: Pick<FieldMetadataItem, 'relation'>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  isWithinNegatedFilter: boolean;
}): boolean => {
  // A null related record truthfully fails the nested predicate, matching
  // the backend NOT EXISTS semantics. A related record that was not loaded
  // leaves the outcome unknown: returning the negation parity keeps the
  // record excluded whether or not a surrounding not flips the result.
  if (relationRecord === null) {
    return false;
  }

  if (!isObject(relationRecord) || Array.isArray(relationRecord)) {
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

  return isRecordMatchingFilter({
    record: relationRecord,
    filter: nestedFilter,
    objectMetadataItem: relationTargetObjectMetadataItem,
    objectMetadataItems,
    isWithinNegatedFilter,
  });
};

export const isRecordMatchingFilter = ({
  record,
  filter,
  objectMetadataItem,
  objectMetadataItems,
  isWithinNegatedFilter = false,
}: {
  record: any;
  filter: RecordGqlOperationFilter;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  isWithinNegatedFilter?: boolean;
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
      }),
    );
  }

  if (isAndFilter(filter)) {
    const filterValue = filter.and;

    if (!Array.isArray(filterValue)) {
      throw new Error(
        'Unexpected value for "and" filter : ' + JSON.stringify(filterValue),
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
      });
    }

    throw new Error('Unexpected value for "or" filter : ' + filterValue);
  }

  if (isNotFilter(filter)) {
    const filterValue = filter.not;

    if (!isDefined(filterValue)) {
      throw new Error('Unexpected value for "not" filter : ' + filterValue);
    }

    return (
      isEmptyObject(filterValue) ||
      !isRecordMatchingFilter({
        record,
        filter: filterValue,
        objectMetadataItem,
        objectMetadataItems,
        isWithinNegatedFilter: !isWithinNegatedFilter,
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
        'Unexpected value for filter key "' + filterKey + '" : ' + filterValue,
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
        'Field metadata item "' +
          filterKey +
          '" not found for object metadata item ' +
          objectMetadataItem.nameSingular,
      );
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
      case FieldMetadataType.FULL_NAME: {
        const fullNameFilter = filterValue as FullNameFilter;

        return (
          (fullNameFilter.firstName === undefined ||
            isMatchingStringFilter({
              stringFilter: fullNameFilter.firstName,
              value: record[filterKey]?.firstName,
            })) &&
          (fullNameFilter.lastName === undefined ||
            isMatchingStringFilter({
              stringFilter: fullNameFilter.lastName,
              value: record[filterKey]?.lastName,
            }))
        );
      }
      case FieldMetadataType.ADDRESS: {
        const addressFilter = filterValue as AddressFilter;

        const keys = [
          'addressStreet1',
          'addressStreet2',
          'addressCity',
          'addressState',
          'addressCountry',
          'addressPostcode',
        ] as const;

        return keys.some((key) => {
          const value = addressFilter[key];
          if (value === undefined) {
            return false;
          }

          return isMatchingStringFilter({
            stringFilter: value,
            value: record[filterKey]?.[key],
          });
        });
      }
      case FieldMetadataType.LINKS: {
        const linksFilter = filterValue as LinksFilter;

        const keys = ['primaryLinkLabel', 'primaryLinkUrl'] as const;

        return keys.some((key) => {
          const value = linksFilter[key];
          if (value === undefined) {
            return false;
          }

          return isMatchingStringFilter({
            stringFilter: value,
            value: record[filterKey]?.[key],
          });
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
      case FieldMetadataType.ACTOR: {
        const actorFilter = filterValue as ActorFilter;

        if (isDefined(actorFilter.workspaceMemberId)) {
          return isMatchingUUIDFilter({
            uuidFilter: actorFilter.workspaceMemberId,
            value: record[filterKey]?.workspaceMemberId,
          });
        }

        if (isDefined(actorFilter.source)) {
          return isMatchingSelectFilter({
            selectFilter: actorFilter.source,
            value: record[filterKey].source,
          });
        }

        return (
          actorFilter.name === undefined ||
          isMatchingStringFilter({
            stringFilter: actorFilter.name,
            value: record[filterKey]?.name,
          })
        );
      }
      case FieldMetadataType.EMAILS: {
        const emailsFilter = filterValue as EmailsFilter;

        if (emailsFilter.primaryEmail === undefined) {
          return false;
        }

        return isMatchingStringFilter({
          stringFilter: emailsFilter.primaryEmail,
          value: record[filterKey]?.primaryEmail,
        });
      }
      case FieldMetadataType.PHONES: {
        const phonesFilter = filterValue as PhonesFilter;

        const keys: (keyof PhonesFilter)[] = ['primaryPhoneNumber'];

        return keys.some((key) => {
          const value = phonesFilter[key];
          if (value === undefined) {
            return false;
          }

          return isMatchingStringFilter({
            stringFilter: value,
            value: record[filterKey]?.[key],
          });
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
            value: record[filterKey],
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
          `Not implemented yet for field type "${objectMetadataField.type}"`,
        );
      }
    }
  });
};
