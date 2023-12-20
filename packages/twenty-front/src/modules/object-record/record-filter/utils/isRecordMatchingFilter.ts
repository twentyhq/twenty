import { isObject } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  AndObjectRecordFilter,
  BooleanFilter,
  DateFilter,
  FloatFilter,
  FullNameFilter,
  LeafObjectRecordFilter,
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

export const isRecordMatchingFilter = ({
  record,
  filter,
  objectMetadataItem,
}: {
  record: any;
  filter: ObjectRecordQueryFilter;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  if (Object.keys(filter).length === 0) {
    return true;
  }

  const currentLevelFilterMatches: boolean[] = [];

  // We consider all the keys at the same level as an "and"
  for (const filterKey in filter) {
    if (filterKey === 'and') {
      const filterValue = (filter as AndObjectRecordFilter).and;

      if (!Array.isArray(filterValue)) {
        throw new Error(
          'Unexpected value for "and" filter : ' + JSON.stringify(filterValue),
        );
      }

      if (filterValue.length === 0) {
        currentLevelFilterMatches.push(true);
        continue;
      }

      const recordIsMatchingAndFilters = filterValue.every((andFilter) =>
        isRecordMatchingFilter({
          record,
          filter: andFilter,
          objectMetadataItem,
        }),
      );

      currentLevelFilterMatches.push(recordIsMatchingAndFilters);
    } else if (filterKey === 'or') {
      const filterValue = (filter as OrObjectRecordFilter).or;

      if (Array.isArray(filterValue)) {
        if (filterValue.length === 0) {
          currentLevelFilterMatches.push(true);
          continue;
        }

        const recordIsMatchingOrFilters = filterValue.some((orFilter) =>
          isRecordMatchingFilter({
            record,
            filter: orFilter,
            objectMetadataItem,
          }),
        );

        currentLevelFilterMatches.push(recordIsMatchingOrFilters);
      } else if (isObject(filterValue)) {
        // The API considers "or" with an object as an "and"
        const recordIsMatchingOrFilters = isRecordMatchingFilter({
          record,
          filter: filterValue,
          objectMetadataItem,
        });

        currentLevelFilterMatches.push(recordIsMatchingOrFilters);
      } else {
        throw new Error('Unexpected value for "or" filter : ' + filterValue);
      }
    } else if (filterKey === 'not') {
      const filterValue = (filter as NotObjectRecordFilter).not;

      if (!isDefined(filterValue)) {
        throw new Error('Unexpected value for "not" filter : ' + filterValue);
      }

      if (isEmptyObject(filterValue)) {
        currentLevelFilterMatches.push(true);
        continue;
      }

      const recordIsMatchingNotFilters = !isRecordMatchingFilter({
        record,
        filter: filterValue,
        objectMetadataItem,
      });

      currentLevelFilterMatches.push(recordIsMatchingNotFilters);
    } else {
      const filterValue = (filter as LeafObjectRecordFilter)[filterKey];

      if (!isDefined(filterValue)) {
        throw new Error(
          'Unexpected value for filter key "' +
            filterKey +
            '" : ' +
            filterValue,
        );
      }

      if (isEmptyObject(filterValue)) {
        currentLevelFilterMatches.push(true);

        continue;
      }

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
          const stringFilter = filterValue as StringFilter;

          currentLevelFilterMatches.push(
            isMatchingStringFilter({
              stringFilter,
              value: record[filterKey],
            }),
          );
          break;
        }
        case FieldMetadataType.Link: {
          const urlFilter = filterValue as URLFilter;

          if (urlFilter.url !== undefined) {
            currentLevelFilterMatches.push(
              isMatchingStringFilter({
                stringFilter: urlFilter.url,
                value: record[filterKey].url,
              }),
            );
          }

          if (urlFilter.label !== undefined) {
            currentLevelFilterMatches.push(
              isMatchingStringFilter({
                stringFilter: urlFilter.label,
                value: record[filterKey].label,
              }),
            );
          }
          break;
        }
        case FieldMetadataType.FullName: {
          const fullNameFilter = filterValue as FullNameFilter;

          if (fullNameFilter.firstName !== undefined) {
            currentLevelFilterMatches.push(
              isMatchingStringFilter({
                stringFilter: fullNameFilter.firstName,
                value: record[filterKey].firstName,
              }),
            );
          }

          if (fullNameFilter.lastName !== undefined) {
            currentLevelFilterMatches.push(
              isMatchingStringFilter({
                stringFilter: fullNameFilter.lastName,
                value: record[filterKey].lastName,
              }),
            );
          }
          break;
        }
        case FieldMetadataType.DateTime: {
          const dateFilter = filterValue as DateFilter;

          currentLevelFilterMatches.push(
            isMatchingDateFilter({
              dateFilter,
              value: record[filterKey],
            }),
          );
          break;
        }
        case FieldMetadataType.Number:
        case FieldMetadataType.Numeric: {
          const numberFilter = filterValue as FloatFilter;

          currentLevelFilterMatches.push(
            isMatchingFloatFilter({
              floatFilter: numberFilter,
              value: record[filterKey],
            }),
          );
          break;
        }
        case FieldMetadataType.Uuid: {
          const uuidFilter = filterValue as UUIDFilter;

          currentLevelFilterMatches.push(
            isMatchingUUIDFilter({
              uuidFilter,
              value: record[filterKey],
            }),
          );
          break;
        }
        case FieldMetadataType.Boolean: {
          const booleanFilter = filterValue as BooleanFilter;

          currentLevelFilterMatches.push(
            isMatchingBooleanFilter({
              booleanFilter,
              value: record[filterKey],
            }),
          );
          break;
        }
        case FieldMetadataType.Relation: {
          throw new Error(
            `Not implemented yet, use UUID filter instead on the corredponding "${filterKey}Id" field`,
          );
        }
        case FieldMetadataType.Currency:
        case FieldMetadataType.MultiSelect:
        case FieldMetadataType.Select:
        case FieldMetadataType.Probability:
        case FieldMetadataType.Rating: {
          throw new Error('Not implemented yet');
        }
      }
    }
  }

  return currentLevelFilterMatches.length > 0
    ? currentLevelFilterMatches.every((match) => !!match)
    : false;
};
