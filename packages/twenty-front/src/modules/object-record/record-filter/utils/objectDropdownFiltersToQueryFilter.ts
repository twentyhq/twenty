import { isNonEmptyString } from '@sniptt/guards';

import {
  ActorFilter,
  AddressFilter,
  CurrencyFilter,
  DateFilter,
  EmailsFilter,
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

import {
  convertGreaterThanRatingToArrayOfRatingValues,
  convertLessThanRatingToArrayOfRatingValues,
  convertRatingToRatingValue,
} from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRatingInput';
import { resolveFilterValue } from '@/views/utils/view-filter-value/resolveFilterValue';
import { endOfDay, roundToNearestMinutes, startOfDay } from 'date-fns';
import { z } from 'zod';
import { Filter } from '../../object-filter-dropdown/types/Filter';

export type ObjectDropdownFilter = Pick<
  Filter,
  'value' | 'operand' | 'fieldMetadataId'
> & {
  definition: {
    type: Filter['definition']['type'];
    subFieldType?: Filter['definition']['subFieldType'];
  };
};

const getEmptyFilter = (
  operand: ViewFilterOperand,
  correspondingField: Pick<Field, 'id' | 'name'>,
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
    case 'PHONES': {
      const phonesFilter = generateILikeFiltersForCompositeFields(
        '',
        correspondingField.name,
        ['primaryPhoneNumber', 'primaryPhoneCountryCode'],
        true,
      );

      emptyRecordFilter = {
        and: phonesFilter,
      };
      break;
    }
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
    case 'RATING':
      emptyRecordFilter = {
        [correspondingField.name]: { is: 'NULL' } as StringFilter,
      };
      break;
    case 'DATE':
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
    case 'ACTOR':
      emptyRecordFilter = {
        or: [
          {
            [correspondingField.name]: {
              name: { ilike: '' },
            } as ActorFilter,
          },
          {
            [correspondingField.name]: {
              name: { is: 'NULL' },
            } as ActorFilter,
          },
        ],
      };
      break;
    case 'EMAILS':
      emptyRecordFilter = {
        or: [
          {
            [correspondingField.name]: {
              primaryEmail: { ilike: '' },
            } as EmailsFilter,
          },
          {
            [correspondingField.name]: {
              primaryEmail: { is: 'NULL' },
            } as EmailsFilter,
          },
        ],
      };
      break;
    default:
      throw new Error(`Unsupported empty filter type ${filterType}`);
  }

  switch (operand) {
    case ViewFilterOperand.IsEmpty:
      return emptyRecordFilter;
    case ViewFilterOperand.IsNotEmpty:
      return {
        not: emptyRecordFilter,
      };
    default:
      throw new Error(`Unknown operand ${operand} for ${filterType} filter`);
  }
};

export const objectDropdownFilterToQueryFilter = (
  rawUIFilter: ObjectDropdownFilter,
  correspondingField: Pick<Field, 'id' | 'name'>,
): RecordGqlOperationFilter | undefined => {
  const isValuelessOperand = [
    ViewFilterOperand.IsEmpty,
    ViewFilterOperand.IsNotEmpty,
    ViewFilterOperand.IsInPast,
    ViewFilterOperand.IsInFuture,
    ViewFilterOperand.IsToday,
  ].includes(rawUIFilter.operand);

  if (!correspondingField) {
    return undefined;
  }

  if (!isValuelessOperand) {
    if (!isDefined(rawUIFilter.value) || rawUIFilter.value === '') {
      return undefined;
    }
  }

  switch (rawUIFilter.definition.type) {
    case 'EMAIL':
    case 'PHONE':
    case 'TEXT':
      switch (rawUIFilter.operand) {
        case ViewFilterOperand.Contains:
          return {
            [correspondingField.name]: {
              ilike: `%${rawUIFilter.value}%`,
            } as StringFilter,
          };
        case ViewFilterOperand.DoesNotContain:
          return {
            not: {
              [correspondingField.name]: {
                ilike: `%${rawUIFilter.value}%`,
              } as StringFilter,
            },
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition.type,
          );
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
          );
      }
    case 'DATE':
    case 'DATE_TIME': {
      const resolvedFilterValue = resolveFilterValue(rawUIFilter);
      const now = roundToNearestMinutes(new Date());
      const date =
        resolvedFilterValue instanceof Date ? resolvedFilterValue : now;

      switch (rawUIFilter.operand) {
        case ViewFilterOperand.IsAfter: {
          return {
            [correspondingField.name]: {
              gt: date.toISOString(),
            } as DateFilter,
          };
        }
        case ViewFilterOperand.IsBefore: {
          return {
            [correspondingField.name]: {
              lt: date.toISOString(),
            } as DateFilter,
          };
        }
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty: {
          return getEmptyFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition.type,
          );
        }
        case ViewFilterOperand.IsRelative: {
          const dateRange = z
            .object({ start: z.date(), end: z.date() })
            .safeParse(resolvedFilterValue).data;

          const defaultDateRange = resolveFilterValue({
            value: 'PAST_1_DAY',
            definition: {
              type: 'DATE',
            },
            operand: ViewFilterOperand.IsRelative,
          });

          if (!defaultDateRange)
            throw new Error('Failed to resolve default date range');

          const { start, end } = dateRange ?? defaultDateRange;

          return {
            and: [
              {
                [correspondingField.name]: {
                  gte: start.toISOString(),
                } as DateFilter,
              },
              {
                [correspondingField.name]: {
                  lte: end.toISOString(),
                } as DateFilter,
              },
            ],
          };
        }
        case ViewFilterOperand.Is: {
          const isValid = resolvedFilterValue instanceof Date;
          const date = isValid ? resolvedFilterValue : now;

          return {
            and: [
              {
                [correspondingField.name]: {
                  lte: endOfDay(date).toISOString(),
                } as DateFilter,
              },
              {
                [correspondingField.name]: {
                  gte: startOfDay(date).toISOString(),
                } as DateFilter,
              },
            ],
          };
        }
        case ViewFilterOperand.IsInPast:
          return {
            [correspondingField.name]: {
              lte: now.toISOString(),
            } as DateFilter,
          };
        case ViewFilterOperand.IsInFuture:
          return {
            [correspondingField.name]: {
              gte: now.toISOString(),
            } as DateFilter,
          };
        case ViewFilterOperand.IsToday: {
          return {
            and: [
              {
                [correspondingField.name]: {
                  lte: endOfDay(now).toISOString(),
                } as DateFilter,
              },
              {
                [correspondingField.name]: {
                  gte: startOfDay(now).toISOString(),
                } as DateFilter,
              },
            ],
          };
        }
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`, //
          );
      }
    }
    case 'RATING':
      switch (rawUIFilter.operand) {
        case ViewFilterOperand.Is:
          return {
            [correspondingField.name]: {
              eq: convertRatingToRatingValue(parseFloat(rawUIFilter.value)),
            } as StringFilter,
          };
        case ViewFilterOperand.GreaterThan:
          return {
            [correspondingField.name]: {
              in: convertGreaterThanRatingToArrayOfRatingValues(
                parseFloat(rawUIFilter.value),
              ),
            } as StringFilter,
          };
        case ViewFilterOperand.LessThan:
          return {
            [correspondingField.name]: {
              in: convertLessThanRatingToArrayOfRatingValues(
                parseFloat(rawUIFilter.value),
              ),
            } as StringFilter,
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition.type,
          );
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
          );
      }
    case 'NUMBER':
      switch (rawUIFilter.operand) {
        case ViewFilterOperand.GreaterThan:
          return {
            [correspondingField.name]: {
              gte: parseFloat(rawUIFilter.value),
            } as FloatFilter,
          };
        case ViewFilterOperand.LessThan:
          return {
            [correspondingField.name]: {
              lte: parseFloat(rawUIFilter.value),
            } as FloatFilter,
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition.type,
          );
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
          );
      }
    case 'RELATION': {
      if (!isValuelessOperand) {
        try {
          JSON.parse(rawUIFilter.value);
        } catch (e) {
          throw new Error(
            `Cannot parse filter value for RELATION filter : "${rawUIFilter.value}"`,
          );
        }

        const parsedRecordIds = JSON.parse(rawUIFilter.value) as string[];

        if (parsedRecordIds.length < 1) {
          return;
        }

        switch (rawUIFilter.operand) {
          case ViewFilterOperand.Is:
            return {
              [correspondingField.name + 'Id']: {
                in: parsedRecordIds,
              } as RelationFilter,
            };
          case ViewFilterOperand.IsNot:
            return {
              not: {
                [correspondingField.name + 'Id']: {
                  in: parsedRecordIds,
                } as RelationFilter,
              },
            };

          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
      } else {
        switch (rawUIFilter.operand) {
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            return getEmptyFilter(
              rawUIFilter.operand,
              correspondingField,
              rawUIFilter.definition.type,
            );
          default:
            throw new Error(
              `Unknown empty operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
      }
    }
    case 'CURRENCY':
      switch (rawUIFilter.operand) {
        case ViewFilterOperand.GreaterThan:
          return {
            [correspondingField.name]: {
              amountMicros: { gte: parseFloat(rawUIFilter.value) * 1000000 },
            } as CurrencyFilter,
          };
        case ViewFilterOperand.LessThan:
          return {
            [correspondingField.name]: {
              amountMicros: { lte: parseFloat(rawUIFilter.value) * 1000000 },
            } as CurrencyFilter,
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition.type,
          );
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
          );
      }
    case 'LINK':
      switch (rawUIFilter.operand) {
        case ViewFilterOperand.Contains:
          return {
            [correspondingField.name]: {
              url: {
                ilike: `%${rawUIFilter.value}%`,
              },
            } as URLFilter,
          };
        case ViewFilterOperand.DoesNotContain:
          return {
            not: {
              [correspondingField.name]: {
                url: {
                  ilike: `%${rawUIFilter.value}%`,
                },
              } as URLFilter,
            },
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition.type,
          );
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
          );
      }
    case 'LINKS': {
      const linksFilters = generateILikeFiltersForCompositeFields(
        rawUIFilter.value,
        correspondingField.name,
        ['primaryLinkLabel', 'primaryLinkUrl'],
      );
      switch (rawUIFilter.operand) {
        case ViewFilterOperand.Contains:
          return {
            or: linksFilters,
          };
        case ViewFilterOperand.DoesNotContain:
          return {
            and: linksFilters.map((filter) => {
              return {
                not: filter,
              };
            }),
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition.type,
          );
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
          );
      }
    }
    case 'FULL_NAME': {
      const fullNameFilters = generateILikeFiltersForCompositeFields(
        rawUIFilter.value,
        correspondingField.name,
        ['firstName', 'lastName'],
      );
      switch (rawUIFilter.operand) {
        case ViewFilterOperand.Contains:
          return {
            or: fullNameFilters,
          };
        case ViewFilterOperand.DoesNotContain:
          return {
            and: fullNameFilters.map((filter) => {
              return {
                not: filter,
              };
            }),
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition.type,
          );
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
          );
      }
    }
    case 'ADDRESS':
      switch (rawUIFilter.operand) {
        case ViewFilterOperand.Contains:
          return {
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
          };
        case ViewFilterOperand.DoesNotContain:
          return {
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
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition.type,
          );
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
          );
      }
    case 'SELECT': {
      if (isValuelessOperand) {
        return getEmptyFilter(
          rawUIFilter.operand,
          correspondingField,
          rawUIFilter.definition.type,
        );
      }
      const stringifiedSelectValues = rawUIFilter.value;
      let parsedOptionValues: string[] = [];

      if (!isNonEmptyString(stringifiedSelectValues)) {
        return;
      }

      try {
        parsedOptionValues = JSON.parse(stringifiedSelectValues);
      } catch (e) {
        throw new Error(
          `Cannot parse filter value for SELECT filter : "${stringifiedSelectValues}"`,
        );
      }

      if (parsedOptionValues.length < 1) {
        return;
      }

      switch (rawUIFilter.operand) {
        case ViewFilterOperand.Is:
          return {
            [correspondingField.name]: {
              in: parsedOptionValues,
            } as UUIDFilter,
          };
        case ViewFilterOperand.IsNot:
          return {
            not: {
              [correspondingField.name]: {
                in: parsedOptionValues,
              } as UUIDFilter,
            },
          };
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
          );
      }
    }
    case 'ACTOR':
      if (rawUIFilter.definition.subFieldType !== undefined) {
        const parsedRecordIds = JSON.parse(rawUIFilter.value) as string[];
        switch (rawUIFilter.definition.subFieldType) {
          case 'SOURCE':
            switch (rawUIFilter.operand) {
              case ViewFilterOperand.Is:
                return {
                  [correspondingField.name]: {
                    source: {
                      in: parsedRecordIds,
                    } as RelationFilter,
                  },
                };
              case ViewFilterOperand.IsNot: {
                if (parsedRecordIds.length < 1) {
                  return;
                }
                return {
                  not: {
                    [correspondingField.name]: {
                      [rawUIFilter.definition.subFieldType.toLowerCase()]: {
                        in: parsedRecordIds,
                      } as RelationFilter,
                    },
                  },
                };
              }

              default:
                throw new Error(
                  `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.subFieldType} filter`,
                );
            }
          default:
            throw new Error(
              `Wrong subFieldType ${rawUIFilter.definition.subFieldType} for ${rawUIFilter.definition.type} filter`,
            );
        }
      } else {
        switch (rawUIFilter.operand) {
          case ViewFilterOperand.Contains:
            return {
              or: [
                {
                  [correspondingField.name]: {
                    name: {
                      ilike: `%${rawUIFilter.value}%`,
                    },
                  } as ActorFilter,
                },
              ],
            };
          case ViewFilterOperand.DoesNotContain:
            return {
              and: [
                {
                  not: {
                    [correspondingField.name]: {
                      name: {
                        ilike: `%${rawUIFilter.value}%`,
                      },
                    } as ActorFilter,
                  },
                },
              ],
            };
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            return getEmptyFilter(
              rawUIFilter.operand,
              correspondingField,
              rawUIFilter.definition.type,
            );
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
      }
    case 'EMAILS':
      switch (rawUIFilter.operand) {
        case ViewFilterOperand.Contains:
          return {
            or: [
              {
                [correspondingField.name]: {
                  primaryEmail: {
                    ilike: `%${rawUIFilter.value}%`,
                  },
                } as EmailsFilter,
              },
            ],
          };
        case ViewFilterOperand.DoesNotContain:
          return {
            and: [
              {
                not: {
                  [correspondingField.name]: {
                    primaryEmail: {
                      ilike: `%${rawUIFilter.value}%`,
                    },
                  } as EmailsFilter,
                },
              },
            ],
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition.type,
          );
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
          );
      }
    case 'PHONES': {
      const phonesFilters = generateILikeFiltersForCompositeFields(
        rawUIFilter.value,
        correspondingField.name,
        ['primaryPhoneNumber', 'primaryPhoneCountryCode'],
      );
      switch (rawUIFilter.operand) {
        case ViewFilterOperand.Contains:
          return {
            or: phonesFilters,
          };
        case ViewFilterOperand.DoesNotContain:
          return {
            and: phonesFilters.map((filter) => {
              return {
                not: filter,
              };
            }),
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition.type,
          );
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
          );
      }
    }
    case 'ADVANCED': {
      throw new Error('Advanced filter not implemented');

      /* const value = resolveFilterValue(rawUIFilter);
        if (!value) {
          console.log('Advanced filter value is null');
          break;
        } */
    }
    default:
      throw new Error('Unknown filter type');
  }
};

export const objectDropdownFiltersToQueryFilter = (
  rawUIFilters: ObjectDropdownFilter[],
  fields: Pick<Field, 'id' | 'name'>[],
): RecordGqlOperationFilter | undefined => {
  const objectRecordFilters = rawUIFilters.map((rawUIFilter) => {
    const correspondingField = fields.find(
      (field) => field.id === rawUIFilter.fieldMetadataId,
    );

    if (!correspondingField) return;

    return objectDropdownFilterToQueryFilter(rawUIFilter, correspondingField);
  });

  return makeAndFilterVariables(objectRecordFilters);
};
