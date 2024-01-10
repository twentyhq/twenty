import { isObject } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  AndObjectRecordFilter,
  BooleanFilter,
  DateFilter,
  FloatFilter,
  FullNameFilter,
  NotObjectRecordFilter,
  ObjectRecordQueryFilter,
  OrObjectRecordFilter,
  StringFilter,
  URLFilter,
  UUIDFilter,
} from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
import { isMatchingBooleanFilter } from '@/object-record/record-filter/utils/isMatchingBooleanFilter';
import { isMatchingDateFilter } from '@/object-record/record-filter/utils/isMatchingDateFilter';
import { isMatchingFloatFilter } from '@/object-record/record-filter/utils/isMatchingFloatFilter';
import { isMatchingStringFilter } from '@/object-record/record-filter/utils/isMatchingStringFilter';
import { isMatchingUUIDFilter } from '@/object-record/record-filter/utils/isMatchingUUIDFilter';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { isEmptyObject } from '~/utils/isEmptyObject';

const isAndFilter = (
  filter: ObjectRecordQueryFilter,
): filter is AndObjectRecordFilter => 'and' in filter && !!filter.and;

const isOrFilter = (
  filter: ObjectRecordQueryFilter,
): filter is OrObjectRecordFilter => 'or' in filter && !!filter.or;

const isNotFilter = (
  filter: ObjectRecordQueryFilter,
): filter is NotObjectRecordFilter => 'not' in filter && !!filter.not;

export const isRecordMatchingFilter = ({
  record,
  filter,
  objectMetadataItem,
}: {
  record: any;
  filter: ObjectRecordQueryFilter;
  objectMetadataItem: ObjectMetadataItem;
}): boolean => {
  if (Object.keys(filter).length === 0) {
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
      case FieldMetadataType.Email:
      case FieldMetadataType.Phone:
      case FieldMetadataType.Text: {
        return isMatchingStringFilter({
          stringFilter: filterValue as StringFilter,
          value: record[filterKey],
        });
      }
      case FieldMetadataType.Link: {
        const urlFilter = filterValue as URLFilter;

        return (
          (urlFilter.url === undefined ||
            isMatchingStringFilter({
              stringFilter: urlFilter.url,
              value: record[filterKey].url,
            })) &&
          (urlFilter.label === undefined ||
            isMatchingStringFilter({
              stringFilter: urlFilter.label,
              value: record[filterKey].label,
            }))
        );
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
      case FieldMetadataType.Relation: {
        throw new Error(
          `Not implemented yet, use UUID filter instead on the corredponding "${filterKey}Id" field`,
        );
      }
      default: {
        throw new Error('Not implemented yet');
      }
    }
  });
};
