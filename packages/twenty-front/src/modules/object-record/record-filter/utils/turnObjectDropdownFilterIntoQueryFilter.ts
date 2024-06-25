import { isNonEmptyString } from '@sniptt/guards';

import {
  AddressFilter,
  CurrencyFilter,
  DateFilter,
  FloatFilter,
  RecordGqlOperationFilter,
  RelationFilter,
  StringFilter,
  URLFilter,
  UUIDFilter,
} from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';
import { makeAndFilterVariables } from '@/object-record/utils/makeAndFilterVariables';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { Field } from '~/generated/graphql';
import { generateILikeFiltersForCompositeFields } from '~/utils/array/generateILikeFiltersForCompositeFields';
import { isDefined } from '~/utils/isDefined';

import { Filter } from '../../object-filter-dropdown/types/Filter';

export type ObjectDropdownFilter = Omit<Filter, 'definition'> & {
  definition: {
    type: Filter['definition']['type'];
  };
};

const applyEmptyFilters = (
  operand: ViewFilterOperand,
  correspondingField: Pick<Field, 'id' | 'name'>,
  objectRecordFilters: RecordGqlOperationFilter[],
  filterType: FilterType,
) => {
  let emptyRecordFilter: RecordGqlOperationFilter = {};

  switch (filterType) {
    case 'TEXT':
    case 'EMAIL':
    case 'PHONE':
      emptyRecordFilter = {
        or: [
          { [correspondingField.name]: { ilike: '' } as StringFilter },
          { [correspondingField.name]: { is: 'NULL' } as StringFilter },
        ],
      };
      break;
    case 'CURRENCY':
      emptyRecordFilter = {
        or: [
          {
            [correspondingField.name]: {
              amountMicros: { is: 'NULL' },
            } as CurrencyFilter,
          },
        ],
      };
      break;
    case 'FULL_NAME': {
      const fullNameFilters = generateILikeFiltersForCompositeFields(
        '',
        correspondingField.name,
        ['firstName', 'lastName'],
        true,
      );

      emptyRecordFilter = {
        and: fullNameFilters,
      };
      break;
    }
    case 'LINK':
      emptyRecordFilter = {
        or: [
          { [correspondingField.name]: { url: { ilike: '' } } as URLFilter },
          {
            [correspondingField.name]: { url: { is: 'NULL' } } as URLFilter,
          },
        ],
      };
      break;
    case 'LINKS': {
      const linksFilters = generateILikeFiltersForCompositeFields(
        '',
        correspondingField.name,
        ['primaryLinkLabel', 'primaryLinkUrl'],
        true,
      );

      emptyRecordFilter = {
        and: linksFilters,
      };
      break;
    }
    case 'ADDRESS':
      emptyRecordFilter = {
        and: [
          {
            or: [
              {
                [correspondingField.name]: {
                  addressStreet1: { ilike: '' },
                } as AddressFilter,
              },
              {
                [correspondingField.name]: {
                  addressStreet1: { is: 'NULL' },
                } as AddressFilter,
              },
            ],
          },
          {
            or: [
              {
                [correspondingField.name]: {
                  addressStreet2: { ilike: '' },
                } as AddressFilter,
              },
              {
                [correspondingField.name]: {
                  addressStreet2: { is: 'NULL' },
                } as AddressFilter,
              },
            ],
          },
          {
            or: [
              {
                [correspondingField.name]: {
                  addressCity: { ilike: '' },
                } as AddressFilter,
              },
              {
                [correspondingField.name]: {
                  addressCity: { is: 'NULL' },
                } as AddressFilter,
              },
            ],
          },
          {
            or: [
              {
                [correspondingField.name]: {
                  addressState: { ilike: '' },
                } as AddressFilter,
              },
              {
                [correspondingField.name]: {
                  addressState: { is: 'NULL' },
                } as AddressFilter,
              },
            ],
          },
          {
            or: [
              {
                [correspondingField.name]: {
                  addressCountry: { ilike: '' },
                } as AddressFilter,
              },
              {
                [correspondingField.name]: {
                  addressCountry: { is: 'NULL' },
                } as AddressFilter,
              },
            ],
          },
          {
            or: [
              {
                [correspondingField.name]: {
                  addressPostcode: { ilike: '' },
                } as AddressFilter,
              },
              {
                [correspondingField.name]: {
                  addressPostcode: { is: 'NULL' },
                } as AddressFilter,
              },
            ],
          },
        ],
      };
      break;
    case 'NUMBER':
      emptyRecordFilter = {
        [correspondingField.name]: { is: 'NULL' } as FloatFilter,
      };
      break;
    case 'DATE_TIME':
      emptyRecordFilter = {
        [correspondingField.name]: { is: 'NULL' } as DateFilter,
      };
      break;
    case 'SELECT':
      emptyRecordFilter = {
        [correspondingField.name]: { is: 'NULL' } as UUIDFilter,
      };
      break;
    case 'RELATION':
      emptyRecordFilter = {
        [correspondingField.name + 'Id']: { is: 'NULL' } as RelationFilter,
      };
      break;
    default:
      throw new Error(`Unsupported empty filter type ${filterType}`);
  }

  switch (operand) {
    case ViewFilterOperand.IsEmpty:
      objectRecordFilters.push(emptyRecordFilter);
      break;
    case ViewFilterOperand.IsNotEmpty:
      objectRecordFilters.push({
        not: emptyRecordFilter,
      });
      break;
    default:
      throw new Error(`Unknown operand ${operand} for ${filterType} filter`);
  }
};

export const turnObjectDropdownFilterIntoQueryFilter = (
  rawUIFilters: ObjectDropdownFilter[],
  fields: Pick<Field, 'id' | 'name'>[],
): RecordGqlOperationFilter | undefined => {
  const objectRecordFilters: RecordGqlOperationFilter[] = [];

  for (const rawUIFilter of rawUIFilters) {
    const correspondingField = fields.find(
      (field) => field.id === rawUIFilter.fieldMetadataId,
    );

    const isEmptyOperand = [
      ViewFilterOperand.IsEmpty,
      ViewFilterOperand.IsNotEmpty,
    ].includes(rawUIFilter.operand);

    if (!correspondingField) {
      continue;
    }

    if (!isEmptyOperand) {
      if (!isDefined(rawUIFilter.value) || rawUIFilter.value === '') {
        continue;
      }
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
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            applyEmptyFilters(
              rawUIFilter.operand,
              correspondingField,
              objectRecordFilters,
              rawUIFilter.definition.type,
            );
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
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            applyEmptyFilters(
              rawUIFilter.operand,
              correspondingField,
              objectRecordFilters,
              rawUIFilter.definition.type,
            );
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
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            applyEmptyFilters(
              rawUIFilter.operand,
              correspondingField,
              objectRecordFilters,
              rawUIFilter.definition.type,
            );
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
      case 'RELATION': {
        if (!isEmptyOperand) {
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
                  } as RelationFilter,
                });
                break;
              case ViewFilterOperand.IsNot:
                if (parsedRecordIds.length > 0) {
                  objectRecordFilters.push({
                    not: {
                      [correspondingField.name + 'Id']: {
                        in: parsedRecordIds,
                      } as RelationFilter,
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
        } else {
          switch (rawUIFilter.operand) {
            case ViewFilterOperand.IsEmpty:
            case ViewFilterOperand.IsNotEmpty:
              applyEmptyFilters(
                rawUIFilter.operand,
                correspondingField,
                objectRecordFilters,
                rawUIFilter.definition.type,
              );
              break;
            default:
              throw new Error(
                `Unknown empty operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
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
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            applyEmptyFilters(
              rawUIFilter.operand,
              correspondingField,
              objectRecordFilters,
              rawUIFilter.definition.type,
            );
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
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            applyEmptyFilters(
              rawUIFilter.operand,
              correspondingField,
              objectRecordFilters,
              rawUIFilter.definition.type,
            );
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
      case 'LINKS': {
        const linksFilters = generateILikeFiltersForCompositeFields(
          rawUIFilter.value,
          correspondingField.name,
          ['primaryLinkLabel', 'primaryLinkUrl'],
        );
        switch (rawUIFilter.operand) {
          case ViewFilterOperand.Contains:
            objectRecordFilters.push({
              or: linksFilters,
            });
            break;
          case ViewFilterOperand.DoesNotContain:
            objectRecordFilters.push({
              and: linksFilters.map((filter) => {
                return {
                  not: filter,
                };
              }),
            });
            break;
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            applyEmptyFilters(
              rawUIFilter.operand,
              correspondingField,
              objectRecordFilters,
              rawUIFilter.definition.type,
            );
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
      }
      case 'FULL_NAME': {
        const fullNameFilters = generateILikeFiltersForCompositeFields(
          rawUIFilter.value,
          correspondingField.name,
          ['firstName', 'lastName'],
        );
        switch (rawUIFilter.operand) {
          case ViewFilterOperand.Contains:
            objectRecordFilters.push({
              or: fullNameFilters,
            });
            break;
          case ViewFilterOperand.DoesNotContain:
            objectRecordFilters.push({
              and: fullNameFilters.map((filter) => {
                return {
                  not: filter,
                };
              }),
            });
            break;
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            applyEmptyFilters(
              rawUIFilter.operand,
              correspondingField,
              objectRecordFilters,
              rawUIFilter.definition.type,
            );
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
      }
      case 'ADDRESS':
        switch (rawUIFilter.operand) {
          case ViewFilterOperand.Contains:
            objectRecordFilters.push({
              or: [
                {
                  [correspondingField.name]: {
                    addressStreet1: {
                      ilike: `%${rawUIFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressStreet2: {
                      ilike: `%${rawUIFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressCity: {
                      ilike: `%${rawUIFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressState: {
                      ilike: `%${rawUIFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressCountry: {
                      ilike: `%${rawUIFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressPostcode: {
                      ilike: `%${rawUIFilter.value}%`,
                    },
                  } as AddressFilter,
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
                      addressStreet1: {
                        ilike: `%${rawUIFilter.value}%`,
                      },
                    } as AddressFilter,
                  },
                },
                {
                  not: {
                    [correspondingField.name]: {
                      addressStreet2: {
                        ilike: `%${rawUIFilter.value}%`,
                      },
                    } as AddressFilter,
                  },
                },
                {
                  not: {
                    [correspondingField.name]: {
                      addressCity: {
                        ilike: `%${rawUIFilter.value}%`,
                      },
                    } as AddressFilter,
                  },
                },
              ],
            });
            break;
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            applyEmptyFilters(
              rawUIFilter.operand,
              correspondingField,
              objectRecordFilters,
              rawUIFilter.definition.type,
            );
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
      case 'SELECT': {
        if (isEmptyOperand) {
          applyEmptyFilters(
            rawUIFilter.operand,
            correspondingField,
            objectRecordFilters,
            rawUIFilter.definition.type,
          );
          break;
        }
        const stringifiedSelectValues = rawUIFilter.value;
        let parsedOptionValues: string[] = [];

        if (!isNonEmptyString(stringifiedSelectValues)) {
          break;
        }

        try {
          parsedOptionValues = JSON.parse(stringifiedSelectValues);
        } catch (e) {
          throw new Error(
            `Cannot parse filter value for SELECT filter : "${stringifiedSelectValues}"`,
          );
        }

        if (parsedOptionValues.length > 0) {
          switch (rawUIFilter.operand) {
            case ViewFilterOperand.Is:
              objectRecordFilters.push({
                [correspondingField.name]: {
                  in: parsedOptionValues,
                } as UUIDFilter,
              });
              break;
            case ViewFilterOperand.IsNot:
              objectRecordFilters.push({
                not: {
                  [correspondingField.name]: {
                    in: parsedOptionValues,
                  } as UUIDFilter,
                },
              });
              break;
            default:
              throw new Error(
                `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
              );
          }
        }
        break;
      }
      default:
        throw new Error('Unknown filter type');
    }
  }

  return makeAndFilterVariables(objectRecordFilters);
};
