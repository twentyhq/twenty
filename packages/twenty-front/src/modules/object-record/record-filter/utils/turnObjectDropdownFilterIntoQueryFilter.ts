import { isNonEmptyString } from '@sniptt/guards';

import {
  CurrencyFilter,
  DateFilter,
  FloatFilter,
  FullNameFilter,
  ObjectRecordQueryFilter,
  StringFilter,
  URLFilter,
  UUIDFilter,
} from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
import { andFilterVariables } from '@/object-record/utils/andFilterVariables';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { Field } from '~/generated/graphql';

import { Filter } from '../../object-filter-dropdown/types/Filter';

export type ObjectDropdownFilter = Omit<Filter, 'definition'> & {
  definition: {
    type: Filter['definition']['type'];
  };
};

export const turnObjectDropdownFilterIntoQueryFilter = (
  rawUIFilters: ObjectDropdownFilter[],
  fields: Pick<Field, 'id' | 'name'>[],
): ObjectRecordQueryFilter | undefined => {
  const objectRecordFilters: ObjectRecordQueryFilter[] = [];

  for (const rawUIFilter of rawUIFilters) {
    const correspondingField = fields.find(
      (field) => field.id === rawUIFilter.fieldMetadataId,
    );

    if (!correspondingField) {
      throw new Error(
        `Could not find field ${rawUIFilter.fieldMetadataId} in metadata object`,
      );
    }

    switch (rawUIFilter.definition.type) {
      case 'EMAIL':
      case 'PHONE':
      case 'TEXT':
        switch (rawUIFilter.operand) {
          case ViewFilterOperand.Contains:
            objectRecordFilters.push({
              [correspondingField.name]: {
                ilike: `%${rawUIFilter.value}%`,
              } as StringFilter,
            });
            break;
          case ViewFilterOperand.DoesNotContain:
            objectRecordFilters.push({
              not: {
                [correspondingField.name]: {
                  ilike: `%${rawUIFilter.value}%`,
                } as StringFilter,
              },
            });
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
      case 'DATE_TIME':
        switch (rawUIFilter.operand) {
          case ViewFilterOperand.GreaterThan:
            objectRecordFilters.push({
              [correspondingField.name]: {
                gte: rawUIFilter.value,
              } as DateFilter,
            });
            break;
          case ViewFilterOperand.LessThan:
            objectRecordFilters.push({
              [correspondingField.name]: {
                lte: rawUIFilter.value,
              } as DateFilter,
            });
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
      case 'NUMBER':
        switch (rawUIFilter.operand) {
          case ViewFilterOperand.GreaterThan:
            objectRecordFilters.push({
              [correspondingField.name]: {
                gte: parseFloat(rawUIFilter.value),
              } as FloatFilter,
            });
            break;
          case ViewFilterOperand.LessThan:
            objectRecordFilters.push({
              [correspondingField.name]: {
                lte: parseFloat(rawUIFilter.value),
              } as FloatFilter,
            });
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
      case 'RELATION': {
        if (!isNonEmptyString(rawUIFilter.value)) {
          break;
        }

        try {
          JSON.parse(rawUIFilter.value);
        } catch (e) {
          throw new Error(
            `Cannot parse filter value for RELATION filter : "${rawUIFilter.value}"`,
          );
        }

        const parsedRecordIds = JSON.parse(rawUIFilter.value) as string[];

        if (parsedRecordIds.length > 0) {
          switch (rawUIFilter.operand) {
            case ViewFilterOperand.Is:
              objectRecordFilters.push({
                [correspondingField.name + 'Id']: {
                  in: parsedRecordIds,
                } as UUIDFilter,
              });
              break;
            case ViewFilterOperand.IsNot:
              if (parsedRecordIds.length) {
                objectRecordFilters.push({
                  not: {
                    [correspondingField.name + 'Id']: {
                      in: parsedRecordIds,
                    } as UUIDFilter,
                  },
                });
              }
              break;
            default:
              throw new Error(
                `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
              );
          }
        }
        break;
      }
      case 'CURRENCY':
        switch (rawUIFilter.operand) {
          case ViewFilterOperand.GreaterThan:
            objectRecordFilters.push({
              [correspondingField.name]: {
                amountMicros: { gte: parseFloat(rawUIFilter.value) * 1000000 },
              } as CurrencyFilter,
            });
            break;
          case ViewFilterOperand.LessThan:
            objectRecordFilters.push({
              [correspondingField.name]: {
                amountMicros: { lte: parseFloat(rawUIFilter.value) * 1000000 },
              } as CurrencyFilter,
            });
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
      case 'LINK':
        switch (rawUIFilter.operand) {
          case ViewFilterOperand.Contains:
            objectRecordFilters.push({
              [correspondingField.name]: {
                url: {
                  ilike: `%${rawUIFilter.value}%`,
                },
              } as URLFilter,
            });
            break;
          case ViewFilterOperand.DoesNotContain:
            objectRecordFilters.push({
              not: {
                [correspondingField.name]: {
                  url: {
                    ilike: `%${rawUIFilter.value}%`,
                  },
                } as URLFilter,
              },
            });
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
      case 'FULL_NAME':
        switch (rawUIFilter.operand) {
          case ViewFilterOperand.Contains:
            objectRecordFilters.push({
              or: [
                {
                  [correspondingField.name]: {
                    firstName: {
                      ilike: `%${rawUIFilter.value}%`,
                    },
                  } as FullNameFilter,
                },
                {
                  [correspondingField.name]: {
                    lastName: {
                      ilike: `%${rawUIFilter.value}%`,
                    },
                  } as FullNameFilter,
                },
              ],
            });
            break;
          case ViewFilterOperand.DoesNotContain:
            objectRecordFilters.push({
              and: [
                {
                  not: {
                    [correspondingField.name]: {
                      firstName: {
                        ilike: `%${rawUIFilter.value}%`,
                      },
                    } as FullNameFilter,
                  },
                },
                {
                  not: {
                    [correspondingField.name]: {
                      lastName: {
                        ilike: `%${rawUIFilter.value}%`,
                      },
                    } as FullNameFilter,
                  },
                },
              ],
            });
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
      default:
        throw new Error('Unknown filter type');
    }
  }

  return andFilterVariables(objectRecordFilters);
};
