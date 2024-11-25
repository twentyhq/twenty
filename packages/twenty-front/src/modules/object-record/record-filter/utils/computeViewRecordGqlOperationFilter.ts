import { isNonEmptyString } from '@sniptt/guards';

import {
  ActorFilter,
  AddressFilter,
  ArrayFilter,
  BooleanFilter,
  CurrencyFilter,
  DateFilter,
  EmailsFilter,
  FloatFilter,
  MultiSelectFilter,
  RatingFilter,
  RawJsonFilter,
  RecordGqlOperationFilter,
  RelationFilter,
  SelectFilter,
  StringFilter,
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
import { getEmptyRecordGqlOperationFilter } from '@/object-record/record-filter/utils/getEmptyRecordGqlOperationFilter';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { resolveFilterValue } from '@/views/view-filter-value/utils/resolveFilterValue';
import { endOfDay, roundToNearestMinutes, startOfDay } from 'date-fns';
import { z } from 'zod';

const computeFilterRecordGqlOperationFilter = (
  filter: Filter,
  fields: Pick<Field, 'id' | 'name'>[],
): RecordGqlOperationFilter | undefined => {
  const correspondingField = fields.find(
    (field) => field.id === filter.fieldMetadataId,
  );

  const compositeFieldName = filter.definition.compositeFieldName;

  const isCompositeFieldFiter = isNonEmptyString(compositeFieldName);

  const isEmptyOperand = [
    ViewFilterOperand.IsEmpty,
    ViewFilterOperand.IsNotEmpty,
    ViewFilterOperand.IsInPast,
    ViewFilterOperand.IsInFuture,
    ViewFilterOperand.IsToday,
  ].includes(filter.operand);

  if (!correspondingField) {
    return;
  }

  if (!isEmptyOperand) {
    if (!isDefined(filter.value) || filter.value === '') {
      return;
    }
  }

  switch (filter.definition.type) {
    case 'TEXT':
      switch (filter.operand) {
        case ViewFilterOperand.Contains:
          return {
            [correspondingField.name]: {
              ilike: `%${filter.value}%`,
            } as StringFilter,
          };
        case ViewFilterOperand.DoesNotContain:
          return {
            not: {
              [correspondingField.name]: {
                ilike: `%${filter.value}%`,
              } as StringFilter,
            },
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyRecordGqlOperationFilter(
            filter.operand,
            correspondingField,
            filter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
          );
      }
    case 'RAW_JSON':
      switch (filter.operand) {
        case ViewFilterOperand.Contains:
          return {
            [correspondingField.name]: {
              like: `%${filter.value}%`,
            } as RawJsonFilter,
          };
        case ViewFilterOperand.DoesNotContain:
          return {
            not: {
              [correspondingField.name]: {
                like: `%${filter.value}%`,
              } as RawJsonFilter,
            },
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyRecordGqlOperationFilter(
            filter.operand,
            correspondingField,
            filter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
          );
      }
    case 'DATE':
    case 'DATE_TIME': {
      const resolvedFilterValue = resolveFilterValue(filter);
      const now = roundToNearestMinutes(new Date());
      const date =
        resolvedFilterValue instanceof Date ? resolvedFilterValue : now;

      switch (filter.operand) {
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
            filter.operand,
            correspondingField,
            filter.definition,
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
            `Unknown operand ${filter.operand} for ${filter.definition.type} filter`, //
          );
      }
    }
    case 'RATING':
      switch (filter.operand) {
        case ViewFilterOperand.Is:
          return {
            [correspondingField.name]: {
              eq: convertRatingToRatingValue(parseFloat(filter.value)),
            } as RatingFilter,
          };
        case ViewFilterOperand.GreaterThan:
          return {
            [correspondingField.name]: {
              in: convertGreaterThanRatingToArrayOfRatingValues(
                parseFloat(filter.value),
              ),
            } as RatingFilter,
          };
        case ViewFilterOperand.LessThan:
          return {
            [correspondingField.name]: {
              in: convertLessThanRatingToArrayOfRatingValues(
                parseFloat(filter.value),
              ),
            } as RatingFilter,
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyRecordGqlOperationFilter(
            filter.operand,
            correspondingField,
            filter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
          );
      }
    case 'NUMBER':
      switch (filter.operand) {
        case ViewFilterOperand.GreaterThan:
          return {
            [correspondingField.name]: {
              gte: parseFloat(filter.value),
            } as FloatFilter,
          };
        case ViewFilterOperand.LessThan:
          return {
            [correspondingField.name]: {
              lte: parseFloat(filter.value),
            } as FloatFilter,
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyRecordGqlOperationFilter(
            filter.operand,
            correspondingField,
            filter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
          );
      }
    case 'RELATION': {
      if (!isEmptyOperand) {
        try {
          JSON.parse(filter.value);
        } catch (e) {
          throw new Error(
            `Cannot parse filter value for RELATION filter : "${filter.value}"`,
          );
        }

        const parsedRecordIds = JSON.parse(filter.value) as string[];

        if (parsedRecordIds.length === 0) return;
        switch (filter.operand) {
          case ViewFilterOperand.Is:
            return {
              [correspondingField.name + 'Id']: {
                in: parsedRecordIds,
              } as RelationFilter,
            };
          case ViewFilterOperand.IsNot: {
            if (parsedRecordIds.length === 0) return;
            return {
              not: {
                [correspondingField.name + 'Id']: {
                  in: parsedRecordIds,
                } as RelationFilter,
              },
            };
          }
          default:
            throw new Error(
              `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
      } else {
        switch (filter.operand) {
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            return getEmptyRecordGqlOperationFilter(
              filter.operand,
              correspondingField,
              filter.definition,
            );
          default:
            throw new Error(
              `Unknown empty operand ${filter.operand} for ${filter.definition.type} filter`,
            );
        }
      }
    }
    case 'CURRENCY':
      switch (filter.operand) {
        case ViewFilterOperand.GreaterThan:
          return {
            [correspondingField.name]: {
              amountMicros: { gte: parseFloat(filter.value) * 1000000 },
            } as CurrencyFilter,
          };
        case ViewFilterOperand.LessThan:
          return {
            [correspondingField.name]: {
              amountMicros: { lte: parseFloat(filter.value) * 1000000 },
            } as CurrencyFilter,
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyRecordGqlOperationFilter(
            filter.operand,
            correspondingField,
            filter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
          );
      }
    case 'LINKS': {
      const linksFilters = generateILikeFiltersForCompositeFields(
        filter.value,
        correspondingField.name,
        ['primaryLinkLabel', 'primaryLinkUrl'],
      );

      switch (filter.operand) {
        case ViewFilterOperand.Contains:
          if (!isCompositeFieldFiter) {
            return {
              or: linksFilters,
            };
          } else {
            return {
              [correspondingField.name]: {
                [compositeFieldName]: {
                  ilike: `%${filter.value}%`,
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
                    ilike: `%${filter.value}%`,
                  },
                },
              },
            };
          }
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyRecordGqlOperationFilter(
            filter.operand,
            correspondingField,
            filter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
          );
      }
    }
    case 'FULL_NAME': {
      const fullNameFilters = generateILikeFiltersForCompositeFields(
        filter.value,
        correspondingField.name,
        ['firstName', 'lastName'],
      );
      switch (filter.operand) {
        case ViewFilterOperand.Contains:
          if (!isCompositeFieldFiter) {
            return {
              or: fullNameFilters,
            };
          } else {
            return {
              [correspondingField.name]: {
                [compositeFieldName]: {
                  ilike: `%${filter.value}%`,
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
                    ilike: `%${filter.value}%`,
                  },
                },
              },
            };
          }
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyRecordGqlOperationFilter(
            filter.operand,
            correspondingField,
            filter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
          );
      }
    }
    case 'ADDRESS':
      switch (filter.operand) {
        case ViewFilterOperand.Contains:
          if (!isCompositeFieldFiter) {
            return {
              or: [
                {
                  [correspondingField.name]: {
                    addressStreet1: {
                      ilike: `%${filter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressStreet2: {
                      ilike: `%${filter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressCity: {
                      ilike: `%${filter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressState: {
                      ilike: `%${filter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressCountry: {
                      ilike: `%${filter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressPostcode: {
                      ilike: `%${filter.value}%`,
                    },
                  } as AddressFilter,
                },
              ],
            };
          } else {
            return {
              [correspondingField.name]: {
                [compositeFieldName]: {
                  ilike: `%${filter.value}%`,
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
                        ilike: `%${filter.value}%`,
                      },
                    } as AddressFilter,
                  },
                },
                {
                  not: {
                    [correspondingField.name]: {
                      addressStreet2: {
                        ilike: `%${filter.value}%`,
                      },
                    } as AddressFilter,
                  },
                },
                {
                  not: {
                    [correspondingField.name]: {
                      addressCity: {
                        ilike: `%${filter.value}%`,
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
                    ilike: `%${filter.value}%`,
                  } as AddressFilter,
                },
              },
            };
          }
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyRecordGqlOperationFilter(
            filter.operand,
            correspondingField,
            filter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
          );
      }
    case 'MULTI_SELECT': {
      if (isEmptyOperand) {
        return getEmptyRecordGqlOperationFilter(
          filter.operand,
          correspondingField,
          filter.definition,
        );
      }

      const options = resolveFilterValue(
        filter as Filter & { definition: { type: 'MULTI_SELECT' } },
      );

      if (options.length === 0) return;

      switch (filter.operand) {
        case ViewFilterOperand.Contains:
          return {
            [correspondingField.name]: {
              containsAny: options,
            } as MultiSelectFilter,
          };
        case ViewFilterOperand.DoesNotContain:
          return {
            or: [
              {
                not: {
                  [correspondingField.name]: {
                    containsAny: options,
                  } as MultiSelectFilter,
                },
              },
              {
                [correspondingField.name]: {
                  isEmptyArray: true,
                } as MultiSelectFilter,
              },
              {
                [correspondingField.name]: {
                  is: 'NULL',
                } as MultiSelectFilter,
              },
            ],
          };
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
          );
      }
    }
    case 'SELECT': {
      if (isEmptyOperand) {
        return getEmptyRecordGqlOperationFilter(
          filter.operand,
          correspondingField,
          filter.definition,
        );
      }
      const options = resolveFilterValue(
        filter as Filter & { definition: { type: 'SELECT' } },
      );

      if (options.length === 0) return;

      switch (filter.operand) {
        case ViewFilterOperand.Is:
          return {
            [correspondingField.name]: {
              in: options,
            } as SelectFilter,
          };
        case ViewFilterOperand.IsNot:
          return {
            not: {
              [correspondingField.name]: {
                in: options,
              } as SelectFilter,
            },
          };
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
          );
      }
    }
    case 'ARRAY': {
      switch (filter.operand) {
        case ViewFilterOperand.Contains:
          return {
            [correspondingField.name]: {
              containsIlike: `%${filter.value}%`,
            } as ArrayFilter,
          };
        case ViewFilterOperand.DoesNotContain:
          return {
            not: {
              [correspondingField.name]: {
                containsIlike: `%${filter.value}%`,
              } as ArrayFilter,
            },
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyRecordGqlOperationFilter(
            filter.operand,
            correspondingField,
            filter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
          );
      }
    }
    // TODO: fix this with a new composite field in ViewFilter entity
    case 'ACTOR': {
      switch (filter.operand) {
        case ViewFilterOperand.Is: {
          const parsedRecordIds = JSON.parse(filter.value) as string[];

          return {
            [correspondingField.name]: {
              source: {
                in: parsedRecordIds,
              } as RelationFilter,
            },
          };
        }
        case ViewFilterOperand.IsNot: {
          const parsedRecordIds = JSON.parse(filter.value) as string[];

          if (parsedRecordIds.length === 0) return;

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
        case ViewFilterOperand.Contains:
          return {
            or: [
              {
                [correspondingField.name]: {
                  name: {
                    ilike: `%${filter.value}%`,
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
                      ilike: `%${filter.value}%`,
                    },
                  } as ActorFilter,
                },
              },
            ],
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyRecordGqlOperationFilter(
            filter.operand,
            correspondingField,
            filter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.definition.label} filter`,
          );
      }
    }
    case 'EMAILS':
      switch (filter.operand) {
        case ViewFilterOperand.Contains:
          return {
            or: [
              {
                [correspondingField.name]: {
                  primaryEmail: {
                    ilike: `%${filter.value}%`,
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
                      ilike: `%${filter.value}%`,
                    },
                  } as EmailsFilter,
                },
              },
            ],
          };
        case ViewFilterOperand.IsEmpty:
        case ViewFilterOperand.IsNotEmpty:
          return getEmptyRecordGqlOperationFilter(
            filter.operand,
            correspondingField,
            filter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
          );
      }
    case 'PHONES': {
      const phonesFilters = generateILikeFiltersForCompositeFields(
        filter.value,
        correspondingField.name,
        ['primaryPhoneNumber', 'primaryPhoneCountryCode'],
      );
      switch (filter.operand) {
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
            filter.operand,
            correspondingField,
            filter.definition,
          );
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.definition.type} filter`,
          );
      }
    }
    case 'BOOLEAN': {
      return {
        [correspondingField.name]: {
          eq: filter.value === 'true',
        } as BooleanFilter,
      };
    }
    default:
      throw new Error('Unknown filter type');
  }
};

const computeViewFilterGroupRecordGqlOperationFilter = (
  filters: Filter[],
  fields: Pick<Field, 'id' | 'name'>[],
  viewFilterGroups: ViewFilterGroup[],
  currentViewFilterGroupId?: string,
): RecordGqlOperationFilter | undefined => {
  const currentViewFilterGroup = viewFilterGroups.find(
    (viewFilterGroup) => viewFilterGroup.id === currentViewFilterGroupId,
  );

  if (!currentViewFilterGroup) {
    return;
  }

  const groupFilters = filters.filter(
    (filter) => filter.viewFilterGroupId === currentViewFilterGroupId,
  );

  const groupRecordGqlOperationFilters = groupFilters
    .map((filter) => computeFilterRecordGqlOperationFilter(filter, fields))
    .filter(isDefined);

  const subGroupRecordGqlOperationFilters = viewFilterGroups
    .filter(
      (viewFilterGroup) =>
        viewFilterGroup.parentViewFilterGroupId === currentViewFilterGroupId,
    )
    .map((subViewFilterGroup) =>
      computeViewFilterGroupRecordGqlOperationFilter(
        filters,
        fields,
        viewFilterGroups,
        subViewFilterGroup.id,
      ),
    )
    .filter(isDefined);

  if (
    currentViewFilterGroup.logicalOperator ===
    ViewFilterGroupLogicalOperator.AND
  ) {
    return {
      and: [
        ...groupRecordGqlOperationFilters,
        ...subGroupRecordGqlOperationFilters,
      ],
    };
  } else if (
    currentViewFilterGroup.logicalOperator === ViewFilterGroupLogicalOperator.OR
  ) {
    return {
      or: [
        ...groupRecordGqlOperationFilters,
        ...subGroupRecordGqlOperationFilters,
      ],
    };
  } else {
    throw new Error(
      `Unknown logical operator ${currentViewFilterGroup.logicalOperator}`,
    );
  }
};

export const computeViewRecordGqlOperationFilter = (
  filters: Filter[],
  fields: Pick<Field, 'id' | 'name'>[],
  viewFilterGroups: ViewFilterGroup[],
): RecordGqlOperationFilter => {
  const regularRecordGqlOperationFilter: RecordGqlOperationFilter[] = filters
    .filter((filter) => !filter.viewFilterGroupId)
    .map((regularFilter) =>
      computeFilterRecordGqlOperationFilter(regularFilter, fields),
    )
    .filter(isDefined);

  const outermostFilterGroupId = viewFilterGroups.find(
    (viewFilterGroup) => !viewFilterGroup.parentViewFilterGroupId,
  )?.id;

  const advancedRecordGqlOperationFilter =
    computeViewFilterGroupRecordGqlOperationFilter(
      filters,
      fields,
      viewFilterGroups,
      outermostFilterGroupId,
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
