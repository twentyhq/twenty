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
  UUIDFilter,
} from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { Field } from '~/generated/graphql';
import { generateILikeFiltersForCompositeFields } from '~/utils/array/generateILikeFiltersForCompositeFields';
import { isDefined } from '~/utils/isDefined';

import {
  convertGreaterThanRatingToArrayOfRatingValues,
  convertLessThanRatingToArrayOfRatingValues,
  convertRatingToRatingValue,
} from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRatingInput';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { getEmptyRecordGqlOperationFilter } from '@/object-record/record-filter/utils/applyEmptyFilters';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { resolveFilterValue } from '@/views/utils/view-filter-value/resolveFilterValue';
import { endOfDay, roundToNearestMinutes, startOfDay } from 'date-fns';
import { z } from 'zod';

// TODO: Rename file before merging

// TODO: break this down into smaller functions and make the whole thing immutable
// Especially applyEmptyFilters
export const filterToRecordGqlOperationFilter = (
  rawUIFilter: Filter,
  fields: Pick<Field, 'id' | 'name'>[],
): RecordGqlOperationFilter | undefined => {
  const correspondingField = fields.find(
    (field) => field.id === rawUIFilter.fieldMetadataId,
  );

  const compositeFieldName = rawUIFilter.definition.compositeFieldName;

  const isCompositeFieldFiter = isNonEmptyString(compositeFieldName);

  const isEmptyOperand = [
    ViewFilterOperand.IsEmpty,
    ViewFilterOperand.IsNotEmpty,
    ViewFilterOperand.IsInPast,
    ViewFilterOperand.IsInFuture,
    ViewFilterOperand.IsToday,
  ].includes(rawUIFilter.operand);

  if (!correspondingField) {
    return;
  }

  if (!isEmptyOperand) {
    if (!isDefined(rawUIFilter.value) || rawUIFilter.value === '') {
      return;
    }
  }

  switch (rawUIFilter.definition.type) {
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
          return getEmptyRecordGqlOperationFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition,
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
          return getEmptyRecordGqlOperationFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition,
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

          if (!defaultDateRange) {
            throw new Error('Failed to resolve default date range');
          }

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
          return getEmptyRecordGqlOperationFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition,
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
          return getEmptyRecordGqlOperationFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
          );
      }
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
              return {
                [correspondingField.name + 'Id']: {
                  in: parsedRecordIds,
                } as RelationFilter,
              };
            case ViewFilterOperand.IsNot:
              if (parsedRecordIds.length > 0) {
                return {
                  not: {
                    [correspondingField.name + 'Id']: {
                      in: parsedRecordIds,
                    } as RelationFilter,
                  },
                };
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
            return getEmptyRecordGqlOperationFilter(
              rawUIFilter.operand,
              correspondingField,
              rawUIFilter.definition,
            );
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
          return getEmptyRecordGqlOperationFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition,
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
          if (!isCompositeFieldFiter) {
            return {
              or: linksFilters,
            };
          } else {
            return {
              [correspondingField.name]: {
                [compositeFieldName]: {
                  ilike: `%${rawUIFilter.value}%`,
                },
              },
            };
          }
        case ViewFilterOperand.DoesNotContain:
          if (!isCompositeFieldFiter) {
            return {
              and: linksFilters.map((filter) => {
                return {
                  not: filter,
                };
              }),
            };
          } else {
            return {
              not: {
                [correspondingField.name]: {
                  [compositeFieldName]: {
                    ilike: `%${rawUIFilter.value}%`,
                  },
                },
              },
            };
          }
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyRecordGqlOperationFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition,
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
          if (!isCompositeFieldFiter) {
            return {
              or: fullNameFilters,
            };
          } else {
            return {
              [correspondingField.name]: {
                [compositeFieldName]: {
                  ilike: `%${rawUIFilter.value}%`,
                },
              },
            };
          }
        case ViewFilterOperand.DoesNotContain:
          if (!isCompositeFieldFiter) {
            return {
              and: fullNameFilters.map((filter) => {
                return {
                  not: filter,
                };
              }),
            };
          } else {
            return {
              not: {
                [correspondingField.name]: {
                  [compositeFieldName]: {
                    ilike: `%${rawUIFilter.value}%`,
                  },
                },
              },
            };
          }
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyRecordGqlOperationFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition,
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
          if (!isCompositeFieldFiter) {
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
          } else {
            return {
              [correspondingField.name]: {
                [compositeFieldName]: {
                  ilike: `%${rawUIFilter.value}%`,
                } as AddressFilter,
              },
            };
          }
        case ViewFilterOperand.DoesNotContain:
          if (!isCompositeFieldFiter) {
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
          } else {
            return {
              not: {
                [correspondingField.name]: {
                  [compositeFieldName]: {
                    ilike: `%${rawUIFilter.value}%`,
                  } as AddressFilter,
                },
              },
            };
          }
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyRecordGqlOperationFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
          );
      }
    case 'SELECT': {
      if (isEmptyOperand) {
        return getEmptyRecordGqlOperationFilter(
          rawUIFilter.operand,
          correspondingField,
          rawUIFilter.definition,
        );
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
      break;
    }
    // TODO: fix this with a new composite field in ViewFilter entity
    case 'ACTOR': {
      switch (rawUIFilter.operand) {
        case ViewFilterOperand.Is: {
          const parsedRecordIds = JSON.parse(rawUIFilter.value) as string[];

          return {
            [correspondingField.name]: {
              source: {
                in: parsedRecordIds,
              } as RelationFilter,
            },
          };
        }
        case ViewFilterOperand.IsNot: {
          const parsedRecordIds = JSON.parse(rawUIFilter.value) as string[];

          if (parsedRecordIds.length > 0) {
            return {
              not: {
                [correspondingField.name]: {
                  source: {
                    in: parsedRecordIds,
                  } as RelationFilter,
                },
              },
            };
          }
          break;
        }
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
          return getEmptyRecordGqlOperationFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.label} filter`,
          );
      }
      break;
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
          return getEmptyRecordGqlOperationFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition,
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
          return getEmptyRecordGqlOperationFilter(
            rawUIFilter.operand,
            correspondingField,
            rawUIFilter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
          );
      }
    }
    default:
      throw new Error('Unknown filter type');
  }
};

const viewFilterGroupToRecordGqlOperationFilter = (
  filters: Filter[],
  fields: Pick<Field, 'id' | 'name'>[],
  viewFilterGroups: ViewFilterGroup[],
  viewFilterGroupId?: string,
): RecordGqlOperationFilter | undefined => {
  const viewFilterGroup = viewFilterGroups.find((viewFilterGroup) =>
    viewFilterGroupId
      ? viewFilterGroup.id === viewFilterGroupId
      : !viewFilterGroup.parentViewFilterGroupId,
  );

  if (!viewFilterGroup) {
    return undefined;
  }

  const groupFilters = filters.filter(
    (filter) => filter.viewFilterGroupId === viewFilterGroupId,
  );

  const groupRecordGqlOperationFilters = groupFilters
    .map((filter) => filterToRecordGqlOperationFilter(filter, fields))
    .filter(isDefined);

  const subGroupRecordGqlOperationFilters = viewFilterGroups
    .filter(
      (viewFilterGroup) =>
        viewFilterGroup.parentViewFilterGroupId === viewFilterGroupId,
    )
    .map((subViewFilterGroup) =>
      viewFilterGroupToRecordGqlOperationFilter(
        filters,
        fields,
        viewFilterGroups,
        subViewFilterGroup.id,
      ),
    )
    .filter(isDefined);

  if (viewFilterGroup.logicalOperator === ViewFilterGroupLogicalOperator.AND) {
    return {
      and: [
        ...groupRecordGqlOperationFilters,
        ...subGroupRecordGqlOperationFilters,
      ],
    };
  } else if (
    viewFilterGroup.logicalOperator === ViewFilterGroupLogicalOperator.OR
  ) {
    return {
      or: [
        ...groupRecordGqlOperationFilters,
        ...subGroupRecordGqlOperationFilters,
      ],
    };
  } else {
    throw new Error(
      `Unknown logical operator ${viewFilterGroup.logicalOperator}`,
    );
  }
};

export const filtersToRecordGqlOperationFilter = (
  filters: Filter[],
  fields: Pick<Field, 'id' | 'name'>[],
  viewFilterGroups?: ViewFilterGroup[], // TODO: Make required
): RecordGqlOperationFilter => {
  if (!viewFilterGroups) {
    throw new Error('viewFilterGroups are required');
  }

  const regularRecordGqlOperationFilter: RecordGqlOperationFilter[] = filters
    .filter((filter) => !filter.viewFilterGroupId)
    .map((regularFilter) =>
      filterToRecordGqlOperationFilter(regularFilter, fields),
    )
    .filter(isDefined);

  const advancedRecordGqlOperationFilter =
    viewFilterGroupToRecordGqlOperationFilter(
      filters,
      fields,
      viewFilterGroups,
    );

  const recordGqlOperationFilters = [
    ...regularRecordGqlOperationFilter,
    advancedRecordGqlOperationFilter,
  ].filter(isDefined);

  if (recordGqlOperationFilters.length === 0) {
    return {};
  }

  if (recordGqlOperationFilters.length === 1) {
    return recordGqlOperationFilters[0];
  }

  const recordGqlOperationFilter = {
    and: recordGqlOperationFilters,
  };

  return recordGqlOperationFilter;
};
