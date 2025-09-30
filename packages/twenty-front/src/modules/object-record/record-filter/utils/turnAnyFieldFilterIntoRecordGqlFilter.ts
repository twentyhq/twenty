import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { createAnyFieldRecordFilterBaseProperties } from '@/object-record/record-filter/utils/createAnyFieldRecordFilterBaseProperties';
import { filterSelectOptionsOfFieldMetadataItem } from '@/object-record/record-filter/utils/filterSelectOptionsOfFieldMetadataItem';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { isNonEmptyString } from '@sniptt/guards';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import {
  isDefined,
  turnRecordFilterIntoRecordGqlOperationFilter,
} from 'twenty-shared/utils';
import { z } from 'zod';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';

export const turnAnyFieldFilterIntoRecordGqlFilter = ({
  filterValue,
  objectMetadataItem,
}: {
  filterValue: string;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const fieldMetadataItems = objectMetadataItem.fields;

  const anyFieldRecordFilters: RecordFilter[] = [];

  const isFilterValueANumber = z.coerce.number().safeParse(filterValue).success;

  for (const fieldMetadataItem of fieldMetadataItems) {
    switch (fieldMetadataItem.type) {
      case FieldMetadataType.TEXT: {
        anyFieldRecordFilters.push({
          ...createAnyFieldRecordFilterBaseProperties({
            filterValue,
            fieldMetadataItem,
          }),
          operand: RecordFilterOperand.Contains,
          type: 'TEXT',
        } satisfies RecordFilter);
        break;
      }
      case FieldMetadataType.ADDRESS: {
        anyFieldRecordFilters.push({
          ...createAnyFieldRecordFilterBaseProperties({
            filterValue,
            fieldMetadataItem,
          }),
          operand: RecordFilterOperand.Contains,
          type: 'ADDRESS',
        } satisfies RecordFilter);
        break;
      }
      case FieldMetadataType.LINKS: {
        anyFieldRecordFilters.push({
          ...createAnyFieldRecordFilterBaseProperties({
            filterValue,
            fieldMetadataItem,
          }),
          operand: RecordFilterOperand.Contains,
          type: 'LINKS',
        } satisfies RecordFilter);
        break;
      }
      case FieldMetadataType.FULL_NAME: {
        anyFieldRecordFilters.push({
          ...createAnyFieldRecordFilterBaseProperties({
            filterValue,
            fieldMetadataItem,
          }),
          operand: RecordFilterOperand.Contains,
          type: 'FULL_NAME',
        } satisfies RecordFilter);
        break;
      }
      case FieldMetadataType.ARRAY: {
        anyFieldRecordFilters.push({
          ...createAnyFieldRecordFilterBaseProperties({
            filterValue,
            fieldMetadataItem,
          }),
          operand: RecordFilterOperand.Contains,
          type: 'ARRAY',
        } satisfies RecordFilter);
        break;
      }
      case FieldMetadataType.EMAILS: {
        anyFieldRecordFilters.push({
          ...createAnyFieldRecordFilterBaseProperties({
            filterValue,
            fieldMetadataItem,
          }),
          operand: RecordFilterOperand.Contains,
          type: 'EMAILS',
        } satisfies RecordFilter);
        break;
      }
      case FieldMetadataType.PHONES: {
        anyFieldRecordFilters.push({
          ...createAnyFieldRecordFilterBaseProperties({
            filterValue,
            fieldMetadataItem,
          }),
          operand: RecordFilterOperand.Contains,
          type: 'PHONES',
        } satisfies RecordFilter);
        break;
      }
      case FieldMetadataType.NUMBER: {
        if (isFilterValueANumber) {
          anyFieldRecordFilters.push({
            ...createAnyFieldRecordFilterBaseProperties({
              filterValue,
              fieldMetadataItem,
            }),
            operand: RecordFilterOperand.Is,
            type: 'NUMBER',
          } satisfies RecordFilter);
        }
        break;
      }
      case FieldMetadataType.CURRENCY: {
        if (isFilterValueANumber) {
          anyFieldRecordFilters.push({
            ...createAnyFieldRecordFilterBaseProperties({
              filterValue,
              fieldMetadataItem,
            }),
            operand: RecordFilterOperand.Is,
            type: 'CURRENCY',
            subFieldName: 'amountMicros',
          } satisfies RecordFilter);
        }

        if (isNonEmptyString(filterValue)) {
          const foundCorrespondingCurrencies = CURRENCIES.filter(
            (currency) =>
              currency.label.includes(filterValue) ||
              currency.value.includes(filterValue),
          );

          if (isNonEmptyArray(foundCorrespondingCurrencies)) {
            const arrayOfCurrenciesStringified = JSON.stringify(
              foundCorrespondingCurrencies.map((currency) => currency.value),
            );

            anyFieldRecordFilters.push({
              ...createAnyFieldRecordFilterBaseProperties({
                filterValue: arrayOfCurrenciesStringified,
                fieldMetadataItem,
              }),
              operand: RecordFilterOperand.Is,
              type: 'CURRENCY',
              subFieldName: 'currencyCode',
            } satisfies RecordFilter);
          }
        }
        break;
      }
      case FieldMetadataType.SELECT: {
        if (isNonEmptyString(filterValue)) {
          const { foundCorrespondingSelectOptions } =
            filterSelectOptionsOfFieldMetadataItem({
              fieldMetadataItem,
              filterValue,
            });

          if (isNonEmptyArray(foundCorrespondingSelectOptions)) {
            const arrayOfSelectValues = JSON.stringify(
              foundCorrespondingSelectOptions.map(
                (selectOption) => selectOption.value,
              ),
            );

            anyFieldRecordFilters.push({
              ...createAnyFieldRecordFilterBaseProperties({
                fieldMetadataItem,
                filterValue: arrayOfSelectValues,
              }),
              operand: RecordFilterOperand.Is,
              type: 'SELECT',
            } satisfies RecordFilter);
          }
        }
        break;
      }
      case FieldMetadataType.MULTI_SELECT: {
        if (isNonEmptyString(filterValue)) {
          const { foundCorrespondingSelectOptions } =
            filterSelectOptionsOfFieldMetadataItem({
              fieldMetadataItem,
              filterValue,
            });

          if (isNonEmptyArray(foundCorrespondingSelectOptions)) {
            const arrayOfSelectValues = JSON.stringify(
              foundCorrespondingSelectOptions.map(
                (selectOption) => selectOption.value,
              ),
            );

            anyFieldRecordFilters.push({
              ...createAnyFieldRecordFilterBaseProperties({
                fieldMetadataItem,
                filterValue: arrayOfSelectValues,
              }),
              operand: RecordFilterOperand.Contains,
              type: 'MULTI_SELECT',
            } satisfies RecordFilter);
          }
        }
        break;
      }
    }
  }

  const baseRecordGqlOperationFilters = anyFieldRecordFilters
    .map((recordFilter) =>
      turnRecordFilterIntoRecordGqlOperationFilter({
        filterValueDependencies: {},
        fieldMetadataItems: objectMetadataItem.fields,
        recordFilter,
      }),
    )
    .filter(isDefined);

  const recordGqlOperationFilter: RecordGqlOperationFilter = {
    or: baseRecordGqlOperationFilters,
  };

  if (baseRecordGqlOperationFilters.length === 0) {
    return { recordGqlOperationFilter: {} };
  }

  return {
    recordGqlOperationFilter,
  };
};
