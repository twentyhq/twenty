import { captureException } from '@sentry/react';
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

const reportedOptimisticRelationFilterFallbackSet = new Set<string>();

const captureOptimisticRelationFilterFallback = ({
  objectNameSingular,
  filterKey,
  reason,
}: {
  objectNameSingular: string;
  filterKey: string;
  reason: 'missing-target-metadata' | 'missing-related-record';
}) => {
  const deduplicationKey = `${objectNameSingular}.${filterKey}.${reason}`;

  if (reportedOptimisticRelationFilterFallbackSet.has(deduplicationKey)) {
    return;
  }

  reportedOptimisticRelationFilterFallbackSet.add(deduplicationKey);

  captureException(
    new Error(
      `Optimistic relation traversal filter fallback for "${objectNameSingular}.${filterKey}" (${reason})`,
    ),
    (scope) => {
      scope.setLevel('warning');
      scope.setTag('error-handler', 'optimistic-filter-matcher');
      scope.setTag('reason', reason);
      scope.setTag('objectNameSingular', objectNameSingular);
      scope.setTag('filterKey', filterKey);
      scope.setFingerprint([
        'optimistic-filter-matcher-relation-traversal-fallback',
        objectNameSingular,
        filterKey,
        reason,
      ]);

      return scope;
    },
  );
};

const isNotFilter = (
  filter: RecordGqlOperationFilter,
): filter is NotObjectRecordFilter => 'not' in filter && !!filter.not;

const isUuidFilter = (value: unknown): value is UUIDFilter => {
  if (!isObject(value)) {
    return false;
  }

  return ['eq', 'neq', 'in', 'is'].some((key) => key in value);
};

export const isRecordMatchingFilter = ({
  record,
  filter,
  objectMetadataItem,
  objectMetadataItems,
}: {
  record: any;
  filter: RecordGqlOperationFilter;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems?: EnrichedObjectMetadataItem[];
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
      case FieldMetadataType.NUMERIC: {
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
        const relationJoinColumnName = computeRelationGqlFieldJoinColumnName({
          name: objectMetadataField.name,
        });

        const isJoinColumn =
          relationJoinColumnName === filterKey ||
          (objectMetadataField.type === FieldMetadataType.MORPH_RELATION &&
            isMorphRelationJoinColumnKey({
              fieldMetadataItem: objectMetadataField,
              key: filterKey,
            }));

        if (isJoinColumn && isUuidFilter(filterValue)) {
          return isMatchingUUIDFilter({
            uuidFilter: filterValue,
            value: record[filterKey],
          });
        }

        if (filterKey === objectMetadataField.name && isUuidFilter(filterValue)) {
          return isMatchingUUIDFilter({
            uuidFilter: filterValue,
            value: record[relationJoinColumnName],
          });
        }

        if (
          filterKey === objectMetadataField.name &&
          isObject(filterValue) &&
          'id' in filterValue &&
          isUuidFilter(filterValue.id)
        ) {
          return isMatchingUUIDFilter({
            uuidFilter: filterValue.id,
            value: record[relationJoinColumnName],
          });
        }

        if (filterKey === objectMetadataField.name && isObject(filterValue)) {
          const relationRecord = record[filterKey];

          if (!isObject(relationRecord)) {
            captureOptimisticRelationFilterFallback({
              objectNameSingular: objectMetadataItem.nameSingular,
              filterKey,
              reason: 'missing-related-record',
            });

            return false;
          }

          const relationTargetObjectMetadataId =
            objectMetadataField.relation?.targetObjectMetadata.id;

          const relationTargetObjectMetadataItem = objectMetadataItems?.find(
            (metadataItem) => metadataItem.id === relationTargetObjectMetadataId,
          );

          if (!isDefined(relationTargetObjectMetadataItem)) {
            captureOptimisticRelationFilterFallback({
              objectNameSingular: objectMetadataItem.nameSingular,
              filterKey,
              reason: 'missing-target-metadata',
            });

            return false;
          }

          return isRecordMatchingFilter({
            record: relationRecord,
            filter: filterValue as RecordGqlOperationFilter,
            objectMetadataItem: relationTargetObjectMetadataItem,
            objectMetadataItems,
          });
        }

        return false;
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
