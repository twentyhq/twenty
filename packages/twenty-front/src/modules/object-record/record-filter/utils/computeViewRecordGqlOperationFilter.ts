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
  PhonesFilter,
  RatingFilter,
  RawJsonFilter,
  RecordGqlOperationFilter,
  RelationFilter,
  SelectFilter,
  StringFilter,
} from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { isDefined } from 'twenty-shared';
import { Field } from '~/generated/graphql';
import { generateILikeFiltersForCompositeFields } from '~/utils/array/generateILikeFiltersForCompositeFields';

import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import {
  convertGreaterThanRatingToArrayOfRatingValues,
  convertLessThanRatingToArrayOfRatingValues,
  convertRatingToRatingValue,
} from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRatingInput';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { RecordFilterValueDependencies } from '@/object-record/record-filter/types/RecordFilterValueDependencies';
import { getEmptyRecordGqlOperationFilter } from '@/object-record/record-filter/utils/getEmptyRecordGqlOperationFilter';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { resolveDateViewFilterValue } from '@/views/view-filter-value/utils/resolveDateViewFilterValue';
import { resolveSelectViewFilterValue } from '@/views/view-filter-value/utils/resolveSelectViewFilterValue';
import { jsonRelationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/jsonRelationFilterValueSchema';
import { simpleRelationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/simpleRelationFilterValueSchema';
import { endOfDay, roundToNearestMinutes, startOfDay } from 'date-fns';
import { z } from 'zod';

import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';

type ComputeFilterRecordGqlOperationFilterParams = {
  filterValueDependencies: RecordFilterValueDependencies;
  filter: RecordFilter;
  fieldMetadataItems: Pick<Field, 'id' | 'name' | 'type'>[];
};

export const computeFilterRecordGqlOperationFilter = ({
  filterValueDependencies,
  filter,
  fieldMetadataItems: fields,
}: ComputeFilterRecordGqlOperationFilterParams):
  | RecordGqlOperationFilter
  | undefined => {
  const correspondingField = fields.find(
    (field) => field.id === filter.fieldMetadataId,
  );

  const compositeFieldName = filter.subFieldName;

  const isCompositeFieldFiter = isNonEmptyString(compositeFieldName);

  const isEmptinessOperand = [
    RecordFilterOperand.IsEmpty,
    RecordFilterOperand.IsNotEmpty,
  ].includes(filter.operand);

  const isDateOperandWithoutValue = [
    RecordFilterOperand.IsInPast,
    RecordFilterOperand.IsInFuture,
    RecordFilterOperand.IsToday,
  ].includes(filter.operand);

  if (!correspondingField) {
    return;
  }

  const filterType = getFilterTypeFromFieldType(correspondingField.type);

  const isFilterValueEmpty = !isDefined(filter.value) || filter.value === '';

  const shouldSkipFiltering =
    !isEmptinessOperand && !isDateOperandWithoutValue && isFilterValueEmpty;

  if (shouldSkipFiltering) {
    return;
  }

  const filterTypesThatHaveNoEmptinessOperand: FilterableFieldType[] = [
    'BOOLEAN',
  ];

  const filterHasEmptinessOperands =
    !filterTypesThatHaveNoEmptinessOperand.includes(filterType);

  if (filterHasEmptinessOperands && isEmptinessOperand) {
    const emptyOperationFilter = getEmptyRecordGqlOperationFilter({
      operand: filter.operand,
      correspondingField,
      recordFilter: filter,
    });

    return emptyOperationFilter;
  }

  switch (filterType) {
    case 'TEXT':
      switch (filter.operand) {
        case RecordFilterOperand.Contains:
          return {
            [correspondingField.name]: {
              ilike: `%${filter.value}%`,
            } as StringFilter,
          };
        case RecordFilterOperand.DoesNotContain:
          return {
            not: {
              [correspondingField.name]: {
                ilike: `%${filter.value}%`,
              } as StringFilter,
            },
          };
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filterType} filter`,
          );
      }
    case 'RAW_JSON':
      switch (filter.operand) {
        case RecordFilterOperand.Contains:
          return {
            [correspondingField.name]: {
              like: `%${filter.value}%`,
            } as RawJsonFilter,
          };
        case RecordFilterOperand.DoesNotContain:
          return {
            not: {
              [correspondingField.name]: {
                like: `%${filter.value}%`,
              } as RawJsonFilter,
            },
          };
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filterType} filter`,
          );
      }
    case 'DATE':
    case 'DATE_TIME': {
      const resolvedFilterValue = resolveDateViewFilterValue(filter);
      const now = roundToNearestMinutes(new Date());
      const date =
        resolvedFilterValue instanceof Date ? resolvedFilterValue : now;

      switch (filter.operand) {
        case RecordFilterOperand.IsAfter: {
          return {
            [correspondingField.name]: {
              gt: date.toISOString(),
            } as DateFilter,
          };
        }
        case RecordFilterOperand.IsBefore: {
          return {
            [correspondingField.name]: {
              lt: date.toISOString(),
            } as DateFilter,
          };
        }
        case RecordFilterOperand.IsRelative: {
          const dateRange = z
            .object({ start: z.date(), end: z.date() })
            .safeParse(resolvedFilterValue).data;

          const defaultDateRange = resolveDateViewFilterValue({
            value: 'PAST_1_DAY',
            operand: RecordFilterOperand.IsRelative,
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
        case RecordFilterOperand.Is: {
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
        case RecordFilterOperand.IsInPast:
          return {
            [correspondingField.name]: {
              lte: now.toISOString(),
            } as DateFilter,
          };
        case RecordFilterOperand.IsInFuture:
          return {
            [correspondingField.name]: {
              gte: now.toISOString(),
            } as DateFilter,
          };
        case RecordFilterOperand.IsToday: {
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
            `Unknown operand ${filter.operand} for ${filterType} filter`, //
          );
      }
    }
    case 'RATING':
      switch (filter.operand) {
        case RecordFilterOperand.Is:
          return {
            [correspondingField.name]: {
              eq: convertRatingToRatingValue(parseFloat(filter.value)),
            } as RatingFilter,
          };
        case RecordFilterOperand.GreaterThan:
          return {
            [correspondingField.name]: {
              in: convertGreaterThanRatingToArrayOfRatingValues(
                parseFloat(filter.value),
              ),
            } as RatingFilter,
          };
        case RecordFilterOperand.LessThan:
          return {
            [correspondingField.name]: {
              in: convertLessThanRatingToArrayOfRatingValues(
                parseFloat(filter.value),
              ),
            } as RatingFilter,
          };
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filterType} filter`,
          );
      }
    case 'NUMBER':
      switch (filter.operand) {
        case RecordFilterOperand.GreaterThan:
          return {
            [correspondingField.name]: {
              gte: parseFloat(filter.value),
            } as FloatFilter,
          };
        case RecordFilterOperand.LessThan:
          return {
            [correspondingField.name]: {
              lte: parseFloat(filter.value),
            } as FloatFilter,
          };
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filterType} filter`,
          );
      }
    case 'RELATION': {
      const { isCurrentWorkspaceMemberSelected, selectedRecordIds } =
        jsonRelationFilterValueSchema
          .catch({
            isCurrentWorkspaceMemberSelected: false,
            selectedRecordIds: simpleRelationFilterValueSchema.parse(
              filter.value,
            ),
          })
          .parse(filter.value);

      const recordIds = isCurrentWorkspaceMemberSelected
        ? [
            ...selectedRecordIds,
            filterValueDependencies.currentWorkspaceMemberId,
          ]
        : selectedRecordIds;

      if (recordIds.length === 0) return;

      switch (filter.operand) {
        case RecordFilterOperand.Is:
          return {
            [correspondingField.name + 'Id']: {
              in: recordIds,
            } as RelationFilter,
          };
        case RecordFilterOperand.IsNot: {
          if (recordIds.length === 0) return;
          return {
            or: [
              {
                not: {
                  [correspondingField.name + 'Id']: {
                    in: recordIds,
                  } as RelationFilter,
                },
              },
              {
                [correspondingField.name + 'Id']: {
                  is: 'NULL',
                } as RelationFilter,
              },
            ],
          };
        }
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'CURRENCY':
      switch (filter.operand) {
        case RecordFilterOperand.GreaterThan:
          return {
            [correspondingField.name]: {
              amountMicros: { gte: parseFloat(filter.value) * 1000000 },
            } as CurrencyFilter,
          };
        case RecordFilterOperand.LessThan:
          return {
            [correspondingField.name]: {
              amountMicros: { lte: parseFloat(filter.value) * 1000000 },
            } as CurrencyFilter,
          };
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filterType} filter`,
          );
      }
    case 'LINKS': {
      const linksFilters = generateILikeFiltersForCompositeFields(
        filter.value,
        correspondingField.name,
        ['primaryLinkLabel', 'primaryLinkUrl'],
      );

      switch (filter.operand) {
        case RecordFilterOperand.Contains:
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
        case RecordFilterOperand.DoesNotContain:
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
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filterType} filter`,
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
        case RecordFilterOperand.Contains:
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
        case RecordFilterOperand.DoesNotContain:
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
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'ADDRESS':
      switch (filter.operand) {
        case RecordFilterOperand.Contains:
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
        case RecordFilterOperand.DoesNotContain:
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
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filterType} filter`,
          );
      }
    case 'MULTI_SELECT': {
      const options = resolveSelectViewFilterValue(filter);

      if (options.length === 0) return;

      switch (filter.operand) {
        case RecordFilterOperand.Contains:
          return {
            [correspondingField.name]: {
              containsAny: options,
            } as MultiSelectFilter,
          };
        case RecordFilterOperand.DoesNotContain:
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
            `Unknown operand ${filter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'SELECT': {
      const options = resolveSelectViewFilterValue(filter);

      if (options.length === 0) return;

      switch (filter.operand) {
        case RecordFilterOperand.Is:
          return {
            [correspondingField.name]: {
              in: options,
            } as SelectFilter,
          };
        case RecordFilterOperand.IsNot:
          return {
            not: {
              [correspondingField.name]: {
                in: options,
              } as SelectFilter,
            },
          };
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'ARRAY': {
      switch (filter.operand) {
        case RecordFilterOperand.Contains:
          return {
            [correspondingField.name]: {
              containsIlike: `%${filter.value}%`,
            } as ArrayFilter,
          };
        case RecordFilterOperand.DoesNotContain:
          return {
            not: {
              [correspondingField.name]: {
                containsIlike: `%${filter.value}%`,
              } as ArrayFilter,
            },
          };
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filterType} filter`,
          );
      }
    }
    // TODO: fix this with a new composite field in ViewFilter entity
    case 'ACTOR': {
      switch (filter.operand) {
        case RecordFilterOperand.Is: {
          const parsedRecordIds = JSON.parse(filter.value) as string[];

          return {
            [correspondingField.name]: {
              source: {
                in: parsedRecordIds,
              } as RelationFilter,
            },
          };
        }
        case RecordFilterOperand.IsNot: {
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
        case RecordFilterOperand.Contains:
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
        case RecordFilterOperand.DoesNotContain:
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
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filter.label} filter`,
          );
      }
    }
    case 'EMAILS':
      switch (filter.operand) {
        case RecordFilterOperand.Contains:
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
        case RecordFilterOperand.DoesNotContain:
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
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filterType} filter`,
          );
      }
    case 'PHONES': {
      const filterValue = filter.value.replace(/[^0-9]/g, '');

      switch (filter.operand) {
        case RecordFilterOperand.Contains:
          return {
            or: [
              {
                [correspondingField.name]: {
                  primaryPhoneNumber: {
                    ilike: `%${filterValue}%`,
                  },
                } as PhonesFilter,
              },
            ],
          };
        case RecordFilterOperand.DoesNotContain:
          return {
            and: [
              {
                not: {
                  [correspondingField.name]: {
                    primaryPhoneNumber: {
                      ilike: `%${filterValue}%`,
                    },
                  } as PhonesFilter,
                },
              },
            ],
          };
        default:
          throw new Error(
            `Unknown operand ${filter.operand} for ${filterType} filter`,
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
  filterValueDependencies: RecordFilterValueDependencies,
  filters: RecordFilter[],
  fields: Pick<Field, 'id' | 'name' | 'type'>[],
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
    .map((filter) =>
      computeFilterRecordGqlOperationFilter({
        filterValueDependencies,
        filter,
        fieldMetadataItems: fields,
      }),
    )
    .filter(isDefined);

  const subGroupRecordGqlOperationFilters = viewFilterGroups
    .filter(
      (viewFilterGroup) =>
        viewFilterGroup.parentViewFilterGroupId === currentViewFilterGroupId,
    )
    .map((subViewFilterGroup) =>
      computeViewFilterGroupRecordGqlOperationFilter(
        filterValueDependencies,
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
  filterValueDependencies: RecordFilterValueDependencies,
  filters: RecordFilter[],
  fields: Pick<Field, 'id' | 'name' | 'type'>[],
  viewFilterGroups: ViewFilterGroup[],
): RecordGqlOperationFilter => {
  const regularRecordGqlOperationFilter: RecordGqlOperationFilter[] = filters
    .filter((filter) => !filter.viewFilterGroupId)
    .map((regularFilter) =>
      computeFilterRecordGqlOperationFilter({
        filterValueDependencies,
        filter: regularFilter,
        fieldMetadataItems: fields,
      }),
    )
    .filter(isDefined);

  const outermostFilterGroupId = viewFilterGroups.find(
    (viewFilterGroup) => !viewFilterGroup.parentViewFilterGroupId,
  )?.id;

  const advancedRecordGqlOperationFilter =
    computeViewFilterGroupRecordGqlOperationFilter(
      filterValueDependencies,
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
