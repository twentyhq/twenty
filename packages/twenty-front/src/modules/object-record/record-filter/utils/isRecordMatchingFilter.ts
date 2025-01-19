import { isObject } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  ActorFilter,
  AddressFilter,
  AndObjectRecordFilter,
  ArrayFilter,
  BooleanFilter,
  CurrencyFilter,
  DateFilter,
  EmailsFilter,
  FloatFilter,
  FullNameFilter,
  LeafObjectRecordFilter,
  LinksFilter,
  MultiSelectFilter,
  NotObjectRecordFilter,
  OrObjectRecordFilter,
  PhonesFilter,
  RatingFilter,
  RawJsonFilter,
  RecordGqlOperationFilter,
  SelectFilter,
  StringFilter,
  UUIDFilter,
} from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { isMatchingArrayFilter } from '@/object-record/record-filter/utils/isMatchingArrayFilter';
import { isMatchingBooleanFilter } from '@/object-record/record-filter/utils/isMatchingBooleanFilter';
import { isMatchingCurrencyFilter } from '@/object-record/record-filter/utils/isMatchingCurrencyFilter';
import { isMatchingDateFilter } from '@/object-record/record-filter/utils/isMatchingDateFilter';
import { isMatchingFloatFilter } from '@/object-record/record-filter/utils/isMatchingFloatFilter';
import { isMatchingMultiSelectFilter } from '@/object-record/record-filter/utils/isMatchingMultiSelectFilter';
import { isMatchingRatingFilter } from '@/object-record/record-filter/utils/isMatchingRatingFilter';
import { isMatchingRawJsonFilter } from '@/object-record/record-filter/utils/isMatchingRawJsonFilter';
import { isMatchingSelectFilter } from '@/object-record/record-filter/utils/isMatchingSelectFilter';
import { isMatchingStringFilter } from '@/object-record/record-filter/utils/isMatchingStringFilter';
import { isMatchingUUIDFilter } from '@/object-record/record-filter/utils/isMatchingUUIDFilter';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { isEmptyObject } from '~/utils/isEmptyObject';

const isLeafFilter = (
  filter: RecordGqlOperationFilter,
): filter is LeafObjectRecordFilter => {
  return !isAndFilter(filter) && !isOrFilter(filter) && !isNotFilter(filter);
};

const isAndFilter = (
  filter: RecordGqlOperationFilter,
): filter is AndObjectRecordFilter => 'and' in filter && !!filter.and;

const isOrFilter = (
  filter: RecordGqlOperationFilter,
): filter is OrObjectRecordFilter => 'or' in filter && !!filter.or;

const isNotFilter = (
  filter: RecordGqlOperationFilter,
): filter is NotObjectRecordFilter => 'not' in filter && !!filter.not;

export const isRecordMatchingFilter = ({
  record,
  filter,
  objectMetadataItem,
}: {
  record: any;
  filter: RecordGqlOperationFilter;
  objectMetadataItem: ObjectMetadataItem;
}): boolean => {
  if (Object.keys(filter).length === 0 && record.deletedAt === null) {
    return true;
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

    const objectMetadataField = objectMetadataItem.fields.find(
      (field) => field.name === filterKey,
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
      case FieldMetadataType.Rating:
        return isMatchingRatingFilter({
          ratingFilter: filterValue as RatingFilter,
          value: record[filterKey],
        });
      case FieldMetadataType.Text: {
        return isMatchingStringFilter({
          stringFilter: filterValue as StringFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.RichText: {
        // TODO: Implement a better rich text filter once it becomes a composite field
        // See this issue for more context: https://github.com/twentyhq/twenty/issues/7613#issuecomment-2408944585
        // This should be tackled in Q4'24
        return isMatchingStringFilter({
          stringFilter: filterValue as StringFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.Select:
        return isMatchingSelectFilter({
          selectFilter: filterValue as SelectFilter,
          value: record[filterKey],
        });
      case FieldMetadataType.MultiSelect:
        return isMatchingMultiSelectFilter({
          multiSelectFilter: filterValue as MultiSelectFilter,
          value: record[filterKey],
        });
      case FieldMetadataType.Array: {
        return isMatchingArrayFilter({
          arrayFilter: filterValue as ArrayFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.RawJson: {
        return isMatchingRawJsonFilter({
          rawJsonFilter: filterValue as RawJsonFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.FullName: {
        const fullNameFilter = filterValue as FullNameFilter;

        return (
          (fullNameFilter.firstName === undefined ||
            isMatchingStringFilter({
              stringFilter: fullNameFilter.firstName,
              value: record[filterKey].firstName,
            })) &&
          (fullNameFilter.lastName === undefined ||
            isMatchingStringFilter({
              stringFilter: fullNameFilter.lastName,
              value: record[filterKey].lastName,
            }))
        );
      }
      case FieldMetadataType.Address: {
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
            value: record[filterKey][key],
          });
        });
      }
      case FieldMetadataType.Links: {
        const linksFilter = filterValue as LinksFilter;

        const keys = ['primaryLinkLabel', 'primaryLinkUrl'] as const;

        return keys.some((key) => {
          const value = linksFilter[key];
          if (value === undefined) {
            return false;
          }

          return isMatchingStringFilter({
            stringFilter: value,
            value: record[filterKey][key],
          });
        });
      }
      case FieldMetadataType.Date:
      case FieldMetadataType.DateTime: {
        return isMatchingDateFilter({
          dateFilter: filterValue as DateFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.Number:
      case FieldMetadataType.Numeric: {
        return isMatchingFloatFilter({
          floatFilter: filterValue as FloatFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.Uuid: {
        return isMatchingUUIDFilter({
          uuidFilter: filterValue as UUIDFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.Boolean: {
        return isMatchingBooleanFilter({
          booleanFilter: filterValue as BooleanFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.Currency: {
        return isMatchingCurrencyFilter({
          currencyFilter: filterValue as CurrencyFilter,
          value: record[filterKey].amountMicros,
        });
      }
      case FieldMetadataType.Actor: {
        const actorFilter = filterValue as ActorFilter;

        return (
          actorFilter.name === undefined ||
          isMatchingStringFilter({
            stringFilter: actorFilter.name,
            value: record[filterKey].name,
          })
        );
      }
      case FieldMetadataType.Emails: {
        const emailsFilter = filterValue as EmailsFilter;

        if (emailsFilter.primaryEmail === undefined) {
          return false;
        }

        return isMatchingStringFilter({
          stringFilter: emailsFilter.primaryEmail,
          value: record[filterKey].primaryEmail,
        });
      }
      case FieldMetadataType.Phones: {
        const phonesFilter = filterValue as PhonesFilter;

        const keys: (keyof PhonesFilter)[] = ['primaryPhoneNumber'];

        return keys.some((key) => {
          const value = phonesFilter[key];
          if (value === undefined) {
            return false;
          }

          return isMatchingStringFilter({
            stringFilter: value,
            value: record[filterKey][key],
          });
        });
      }
      case FieldMetadataType.Relation: {
        throw new Error(
          `Not implemented yet, use UUID filter instead on the corredponding "${filterKey}Id" field`,
        );
      }

      default: {
        throw new Error(
          `Not implemented yet for field type "${objectMetadataField.type}"`,
        );
      }
    }
  });
};
