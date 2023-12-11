import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { Field } from '~/generated/graphql';

import { Filter } from '../types/Filter';
import { DateFilter, FloatFilter, FullNameFilter, RequestFilter, StringFilter, URLFilter } from '@/object-record/object-filter-dropdown/types/FilterRequest';

export type FilterToTurnIntoWhereClause = Omit<Filter, 'definition'> & {
  definition: {
    type: Filter['definition']['type'];
  };
};

export const turnFiltersIntoWhereClause = (
  filters: FilterToTurnIntoWhereClause[],
  fields: Pick<Field, 'id' | 'name'>[],
): RequestFilter => {
  const requestFilters: RequestFilter[] = [];

  for(const filter of filters) {
    const correspondingField = fields.find(
      (field) => field.id === filter.fieldMetadataId,
    );
    if (!correspondingField) {
      throw new Error(
        `Could not find field ${filter.fieldMetadataId} in metadata object`,
      );
    }

    switch (filter.definition.type) {
      case 'EMAIL':
      case 'PHONE':
      case 'TEXT':
        switch (filter.operand) {
          case ViewFilterOperand.Contains:
            requestFilters.push({
              [correspondingField.name]: {
                ilike: `%${filter.value}%`,
              } as StringFilter,
            });
            break
          case ViewFilterOperand.DoesNotContain:
            requestFilters.push({
              not: {
                [correspondingField.name]: {
                  ilike: `%${filter.value}%`,
                } as StringFilter,
              },
            });
           break
          default:
            throw new Error(
              `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
        break;
      case 'DATE_TIME':
        switch (filter.operand) {
          case ViewFilterOperand.GreaterThan:
            requestFilters.push({
              [correspondingField.name]: {
                gte: filter.value,
              } as DateFilter,
            });
            break;
          case ViewFilterOperand.LessThan:
            requestFilters.push({
              [correspondingField.name]: {
                lte: filter.value,
              } as DateFilter,
            });
            break;
          default:
            throw new Error(
              `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
        break;
      case 'NUMBER':
        switch (filter.operand) {
          case ViewFilterOperand.GreaterThan:
            requestFilters.push({
              [correspondingField.name]: {
                gte: parseFloat(filter.value),
              } as FloatFilter,
            });
            break;
          case ViewFilterOperand.LessThan:
            requestFilters.push({
              [correspondingField.name]: {
                lte: parseFloat(filter.value),
              } as FloatFilter,
            });
            break;
          default:
            throw new Error(
              `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
        break;
      case 'RELATION':
        try {
          JSON.parse(filter.value);
        } catch (e) {
          throw new Error(
            `Cannot parse filter value for RELATION filter : "${filter.value}"`,
          );
        }

        const parsedRecordIds = JSON.parse(filter.value) as string[];

        if (parsedRecordIds.length > 0) {
          switch (filter.operand) {
            case ViewFilterOperand.Is:
              requestFilters.push({
                [correspondingField.name + 'Id']: {
                  in: parsedRecordIds,
                } as StringFilter,
              });
              break;
            case ViewFilterOperand.IsNot:
              requestFilters.push({
                not: {
                  [correspondingField.name + 'Id']: {
                    in: parsedRecordIds,
                  } as StringFilter,
                },
              });
              break;
            default:
              throw new Error(
                `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
              );
          }
        }
        break;
      case 'CURRENCY':
        switch (filter.operand) {
          case ViewFilterOperand.GreaterThan:
            requestFilters.push({
              [correspondingField.name]: {
                amountMicros: { gte: parseFloat(filter.value) * 1000000 },
              },
            });
            break;
          case ViewFilterOperand.LessThan:
            requestFilters.push({
              [correspondingField.name]: {
                amountMicros: { lte: parseFloat(filter.value) * 1000000 },
              },
            });
            break;
          default:
            throw new Error(
              `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
        break;
      case 'LINK':
        switch (filter.operand) {
          case ViewFilterOperand.Contains:
            requestFilters.push({
              [correspondingField.name]: {
                url: {
                  ilike: `%${filter.value}%`,
                },
              } as URLFilter,
            });
            break;
          case ViewFilterOperand.DoesNotContain:
            requestFilters.push({
              not: {
                [correspondingField.name]: {
                  url: {
                    ilike: `%${filter.value}%`,
                  },
                } as URLFilter,
              },
            });
            break;
          default:
            throw new Error(
              `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
        break;
      case 'FULL_NAME':
        switch (filter.operand) {
          case ViewFilterOperand.Contains:
            requestFilters.push({
              or: [
                {
                  [correspondingField.name]: {
                    firstName: {
                      ilike: `%${filter.value}%`,
                    },
                  } as FullNameFilter,
                },
                {
                  [correspondingField.name]: {
                    lastName: {
                      ilike: `%${filter.value}%`,
                    },
                  } as FullNameFilter,
                },
              ],
            });
            break;
          case ViewFilterOperand.DoesNotContain:
            requestFilters.push({
              and: [
                {
                  not: {
                    [correspondingField.name]: {
                      firstName: {
                        ilike: `%${filter.value}%`,
                      },
                    } as FullNameFilter,
                  },
                },
                {
                  not: {
                    [correspondingField.name]: {
                      lastName: {
                        ilike: `%${filter.value}%`,
                      },
                    } as FullNameFilter,
                  },
                },
              ],
            });
            break;
          default:
            throw new Error(
              `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
        break;
      default:
        throw new Error('Unknown filter type');
    }
  }

  return { and: requestFilters };
};
