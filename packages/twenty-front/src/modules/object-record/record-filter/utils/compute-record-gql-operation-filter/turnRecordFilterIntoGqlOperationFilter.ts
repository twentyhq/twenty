import { isNonEmptyString } from '@sniptt/guards';

import {
  ActorFilter,
  AddressFilter,
  ArrayFilter,
  BooleanFilter,
  CurrencyFilter,
  DateFilter,
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

import { resolveDateViewFilterValue } from '@/views/view-filter-value/utils/resolveDateViewFilterValue';
import { resolveSelectViewFilterValue } from '@/views/view-filter-value/utils/resolveSelectViewFilterValue';
import { jsonRelationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/jsonRelationFilterValueSchema';
import { simpleRelationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/simpleRelationFilterValueSchema';
import { endOfDay, roundToNearestMinutes, startOfDay } from 'date-fns';
import { z } from 'zod';

import { isExpectedSubFieldName } from '@/object-record/object-filter-dropdown/utils/isExpectedSubFieldName';
import { checkIfShouldComputeEmptinessFilter } from '@/object-record/record-filter/utils/compute-record-gql-operation-filter/checkIfShouldComputeEmptinessFilter';
import { checkIfShouldSkipFiltering } from '@/object-record/record-filter/utils/compute-record-gql-operation-filter/checkIfShouldSkipFiltering';
import { computeGqlOperationFilterForEmails } from '@/object-record/record-filter/utils/compute-record-gql-operation-filter/for-composite-field/computeGqlOperationFilterForEmails';
import { computeGqlOperationFilterForLinks } from '@/object-record/record-filter/utils/compute-record-gql-operation-filter/for-composite-field/computeGqlOperationFilterForLinks';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type TurnRecordFilterIntoRecordGqlOperationFilterParams = {
  filterValueDependencies: RecordFilterValueDependencies;
  recordFilter: RecordFilter;
  fieldMetadataItems: Pick<Field, 'id' | 'name' | 'type'>[];
};

export const turnRecordFilterIntoRecordGqlOperationFilter = ({
  filterValueDependencies,
  recordFilter,
  fieldMetadataItems,
}: TurnRecordFilterIntoRecordGqlOperationFilterParams):
  | RecordGqlOperationFilter
  | undefined => {
  const correspondingFieldMetadataItem = fieldMetadataItems.find(
    (field) => field.id === recordFilter.fieldMetadataId,
  );

  if (!isDefined(correspondingFieldMetadataItem)) {
    return;
  }

  const shouldSkipFiltering = checkIfShouldSkipFiltering({ recordFilter });

  if (shouldSkipFiltering) {
    return;
  }

  const shouldComputeEmptinessFilter = checkIfShouldComputeEmptinessFilter({
    recordFilter,
    correspondingFieldMetadataItem,
  });

  if (shouldComputeEmptinessFilter) {
    const emptinessFilter = getEmptyRecordGqlOperationFilter({
      operand: recordFilter.operand,
      correspondingField: correspondingFieldMetadataItem,
      recordFilter: recordFilter,
    });

    return emptinessFilter;
  }

  const subFieldName = recordFilter.subFieldName;

  const isSubFieldFilter = isNonEmptyString(subFieldName);

  const filterType = getFilterTypeFromFieldType(
    correspondingFieldMetadataItem.type,
  );

  switch (filterType) {
    case 'TEXT':
      switch (recordFilter.operand) {
        case RecordFilterOperand.Contains:
          return {
            [correspondingFieldMetadataItem.name]: {
              ilike: `%${recordFilter.value}%`,
            } as StringFilter,
          };
        case RecordFilterOperand.DoesNotContain:
          return {
            not: {
              [correspondingFieldMetadataItem.name]: {
                ilike: `%${recordFilter.value}%`,
              } as StringFilter,
            },
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    case 'RAW_JSON':
      switch (recordFilter.operand) {
        case RecordFilterOperand.Contains:
          return {
            [correspondingFieldMetadataItem.name]: {
              like: `%${recordFilter.value}%`,
            } as RawJsonFilter,
          };
        case RecordFilterOperand.DoesNotContain:
          return {
            not: {
              [correspondingFieldMetadataItem.name]: {
                like: `%${recordFilter.value}%`,
              } as RawJsonFilter,
            },
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    case 'DATE':
    case 'DATE_TIME': {
      const resolvedFilterValue = resolveDateViewFilterValue(recordFilter);
      const now = roundToNearestMinutes(new Date());
      const date =
        resolvedFilterValue instanceof Date ? resolvedFilterValue : now;

      switch (recordFilter.operand) {
        case RecordFilterOperand.IsAfter: {
          return {
            [correspondingFieldMetadataItem.name]: {
              gt: date.toISOString(),
            } as DateFilter,
          };
        }
        case RecordFilterOperand.IsBefore: {
          return {
            [correspondingFieldMetadataItem.name]: {
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
                [correspondingFieldMetadataItem.name]: {
                  gte: start.toISOString(),
                } as DateFilter,
              },
              {
                [correspondingFieldMetadataItem.name]: {
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
                [correspondingFieldMetadataItem.name]: {
                  lte: endOfDay(date).toISOString(),
                } as DateFilter,
              },
              {
                [correspondingFieldMetadataItem.name]: {
                  gte: startOfDay(date).toISOString(),
                } as DateFilter,
              },
            ],
          };
        }
        case RecordFilterOperand.IsInPast:
          return {
            [correspondingFieldMetadataItem.name]: {
              lte: now.toISOString(),
            } as DateFilter,
          };
        case RecordFilterOperand.IsInFuture:
          return {
            [correspondingFieldMetadataItem.name]: {
              gte: now.toISOString(),
            } as DateFilter,
          };
        case RecordFilterOperand.IsToday: {
          return {
            and: [
              {
                [correspondingFieldMetadataItem.name]: {
                  lte: endOfDay(now).toISOString(),
                } as DateFilter,
              },
              {
                [correspondingFieldMetadataItem.name]: {
                  gte: startOfDay(now).toISOString(),
                } as DateFilter,
              },
            ],
          };
        }
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`, //
          );
      }
    }
    case 'RATING':
      switch (recordFilter.operand) {
        case RecordFilterOperand.Is:
          return {
            [correspondingFieldMetadataItem.name]: {
              eq: convertRatingToRatingValue(parseFloat(recordFilter.value)),
            } as RatingFilter,
          };
        case RecordFilterOperand.GreaterThan:
          return {
            [correspondingFieldMetadataItem.name]: {
              in: convertGreaterThanRatingToArrayOfRatingValues(
                parseFloat(recordFilter.value),
              ),
            } as RatingFilter,
          };
        case RecordFilterOperand.LessThan:
          return {
            [correspondingFieldMetadataItem.name]: {
              in: convertLessThanRatingToArrayOfRatingValues(
                parseFloat(recordFilter.value),
              ),
            } as RatingFilter,
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    case 'NUMBER':
      switch (recordFilter.operand) {
        case RecordFilterOperand.GreaterThan:
          return {
            [correspondingFieldMetadataItem.name]: {
              gte: parseFloat(recordFilter.value),
            } as FloatFilter,
          };
        case RecordFilterOperand.LessThan:
          return {
            [correspondingFieldMetadataItem.name]: {
              lte: parseFloat(recordFilter.value),
            } as FloatFilter,
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    case 'RELATION': {
      const { isCurrentWorkspaceMemberSelected, selectedRecordIds } =
        jsonRelationFilterValueSchema
          .catch({
            isCurrentWorkspaceMemberSelected: false,
            selectedRecordIds: simpleRelationFilterValueSchema.parse(
              recordFilter.value,
            ),
          })
          .parse(recordFilter.value);

      const recordIds = isCurrentWorkspaceMemberSelected
        ? [
            ...selectedRecordIds,
            filterValueDependencies.currentWorkspaceMemberId,
          ]
        : selectedRecordIds;

      if (recordIds.length === 0) return;

      switch (recordFilter.operand) {
        case RecordFilterOperand.Is:
          return {
            [correspondingFieldMetadataItem.name + 'Id']: {
              in: recordIds,
            } as RelationFilter,
          };
        case RecordFilterOperand.IsNot: {
          if (recordIds.length === 0) return;
          return {
            or: [
              {
                not: {
                  [correspondingFieldMetadataItem.name + 'Id']: {
                    in: recordIds,
                  } as RelationFilter,
                },
              },
              {
                [correspondingFieldMetadataItem.name + 'Id']: {
                  is: 'NULL',
                } as RelationFilter,
              },
            ],
          };
        }
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'CURRENCY': {
      if (
        isExpectedSubFieldName(
          FieldMetadataType.CURRENCY,
          'currencyCode',
          subFieldName,
        )
      ) {
        const parsedCurrencyCodes = JSON.parse(recordFilter.value) as string[];

        if (parsedCurrencyCodes.length === 0) return undefined;

        const gqlFilter: RecordGqlOperationFilter = {
          [correspondingFieldMetadataItem.name]: {
            currencyCode: { in: parsedCurrencyCodes },
          } as CurrencyFilter,
        };

        switch (recordFilter.operand) {
          case RecordFilterOperand.Is:
            return gqlFilter;
          case RecordFilterOperand.IsNot:
            return {
              not: gqlFilter,
            };
          default:
            throw new Error(
              `Unknown operand ${recordFilter.operand} for ${filterType} / ${subFieldName} filter`,
            );
        }
      } else if (
        isExpectedSubFieldName(
          FieldMetadataType.CURRENCY,
          'amountMicros',
          subFieldName,
        ) ||
        !isSubFieldFilter
      ) {
        switch (recordFilter.operand) {
          case RecordFilterOperand.GreaterThan:
            return {
              [correspondingFieldMetadataItem.name]: {
                amountMicros: { gte: parseFloat(recordFilter.value) * 1000000 },
              } as CurrencyFilter,
            };
          case RecordFilterOperand.LessThan:
            return {
              [correspondingFieldMetadataItem.name]: {
                amountMicros: { lte: parseFloat(recordFilter.value) * 1000000 },
              } as CurrencyFilter,
            };
          case RecordFilterOperand.Is:
            return {
              [correspondingFieldMetadataItem.name]: {
                amountMicros: { eq: parseFloat(recordFilter.value) * 1000000 },
              } as CurrencyFilter,
            };
          case RecordFilterOperand.IsNot:
            return {
              not: {
                [correspondingFieldMetadataItem.name]: {
                  amountMicros: {
                    eq: parseFloat(recordFilter.value) * 1000000,
                  },
                } as CurrencyFilter,
              },
            };
          default:
            throw new Error(
              `Unknown operand ${recordFilter.operand} for ${filterType} / ${subFieldName}  filter`,
            );
        }
      } else {
        throw new Error(
          `Unknown subfield ${subFieldName} for ${filterType} filter`,
        );
      }
    }
    case 'LINKS': {
      return computeGqlOperationFilterForLinks({
        correspondingFieldMetadataItem,
        recordFilter,
        subFieldName,
      });
    }
    case 'FULL_NAME': {
      const fullNameFilters = generateILikeFiltersForCompositeFields(
        recordFilter.value,
        correspondingFieldMetadataItem.name,
        ['firstName', 'lastName'],
      );
      switch (recordFilter.operand) {
        case RecordFilterOperand.Contains:
          if (!isSubFieldFilter) {
            return {
              or: fullNameFilters,
            };
          } else {
            return {
              [correspondingFieldMetadataItem.name]: {
                [subFieldName]: {
                  ilike: `%${recordFilter.value}%`,
                },
              },
            };
          }
        case RecordFilterOperand.DoesNotContain:
          if (!isSubFieldFilter) {
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
                [correspondingFieldMetadataItem.name]: {
                  [subFieldName]: {
                    ilike: `%${recordFilter.value}%`,
                  },
                },
              },
            };
          }
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'ADDRESS':
      switch (recordFilter.operand) {
        case RecordFilterOperand.Contains:
          if (!isSubFieldFilter) {
            return {
              or: [
                {
                  [correspondingFieldMetadataItem.name]: {
                    addressStreet1: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    addressStreet2: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    addressCity: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    addressState: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    addressCountry: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    addressPostcode: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
              ],
            };
          } else {
            if (subFieldName === 'addressCountry') {
              const parsedCountryCodes = JSON.parse(
                recordFilter.value,
              ) as string[];

              if (
                recordFilter.value === '[]' ||
                parsedCountryCodes.length === 0
              ) {
                return {};
              }

              return {
                [correspondingFieldMetadataItem.name]: {
                  [subFieldName]: {
                    in: parsedCountryCodes,
                  } as AddressFilter,
                },
              };
            }

            return {
              [correspondingFieldMetadataItem.name]: {
                [subFieldName]: {
                  ilike: `%${recordFilter.value}%`,
                } as AddressFilter,
              },
            };
          }
        case RecordFilterOperand.DoesNotContain:
          if (!isSubFieldFilter) {
            return {
              and: [
                {
                  or: [
                    {
                      not: {
                        [correspondingFieldMetadataItem.name]: {
                          addressStreet1: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [correspondingFieldMetadataItem.name]: {
                        addressStreet1: {
                          is: 'NULL',
                        },
                      },
                    },
                  ],
                },
                {
                  or: [
                    {
                      not: {
                        [correspondingFieldMetadataItem.name]: {
                          addressStreet2: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [correspondingFieldMetadataItem.name]: {
                        addressStreet2: {
                          is: 'NULL',
                        },
                      },
                    },
                  ],
                },
                {
                  or: [
                    {
                      not: {
                        [correspondingFieldMetadataItem.name]: {
                          addressCity: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [correspondingFieldMetadataItem.name]: {
                        addressCity: {
                          is: 'NULL',
                        },
                      },
                    },
                  ],
                },
                {
                  or: [
                    {
                      not: {
                        [correspondingFieldMetadataItem.name]: {
                          addressState: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [correspondingFieldMetadataItem.name]: {
                        addressState: {
                          is: 'NULL',
                        },
                      },
                    },
                  ],
                },
                {
                  or: [
                    {
                      not: {
                        [correspondingFieldMetadataItem.name]: {
                          addressPostcode: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [correspondingFieldMetadataItem.name]: {
                        addressPostcode: {
                          is: 'NULL',
                        },
                      },
                    },
                  ],
                },
                {
                  or: [
                    {
                      not: {
                        [correspondingFieldMetadataItem.name]: {
                          addressCountry: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [correspondingFieldMetadataItem.name]: {
                        addressCountry: {
                          is: 'NULL',
                        },
                      },
                    },
                  ],
                },
              ],
            };
          } else {
            if (subFieldName === 'addressCountry') {
              const parsedCountryCodes = JSON.parse(
                recordFilter.value,
              ) as string[];

              if (
                recordFilter.value === '[]' ||
                parsedCountryCodes.length === 0
              ) {
                return {};
              }

              return {
                or: [
                  {
                    not: {
                      [correspondingFieldMetadataItem.name]: {
                        addressCountry: {
                          in: JSON.parse(recordFilter.value),
                        } as AddressFilter,
                      },
                    },
                  },
                  {
                    [correspondingFieldMetadataItem.name]: {
                      addressCountry: {
                        is: 'NULL',
                      } as AddressFilter,
                    },
                  },
                ],
              };
            }

            return {
              or: [
                {
                  not: {
                    [correspondingFieldMetadataItem.name]: {
                      [subFieldName]: {
                        ilike: `%${recordFilter.value}%`,
                      } as AddressFilter,
                    },
                  },
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    [subFieldName]: {
                      is: 'NULL',
                    } as AddressFilter,
                  },
                },
              ],
            };
          }
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    case 'MULTI_SELECT': {
      const options = resolveSelectViewFilterValue(recordFilter);

      if (options.length === 0) return;

      const emptyOptions = options.filter((option: string) => option === '');
      const nonEmptyOptions = options.filter((option: string) => option !== '');

      switch (recordFilter.operand) {
        case RecordFilterOperand.Contains: {
          const conditions = [];

          if (nonEmptyOptions.length > 0) {
            conditions.push({
              [correspondingFieldMetadataItem.name]: {
                containsAny: nonEmptyOptions,
              } as MultiSelectFilter,
            });
          }

          if (emptyOptions.length > 0) {
            conditions.push({
              [correspondingFieldMetadataItem.name]: {
                isEmptyArray: true,
              } as MultiSelectFilter,
            });
          }

          return conditions.length === 1 ? conditions[0] : { or: conditions };
        }
        case RecordFilterOperand.DoesNotContain:
          return {
            or: [
              {
                not: {
                  [correspondingFieldMetadataItem.name]: {
                    containsAny: nonEmptyOptions,
                  } as MultiSelectFilter,
                },
              },
              {
                [correspondingFieldMetadataItem.name]: {
                  isEmptyArray: true,
                } as MultiSelectFilter,
              },
              {
                [correspondingFieldMetadataItem.name]: {
                  is: 'NULL',
                } as MultiSelectFilter,
              },
            ],
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'SELECT': {
      const options = resolveSelectViewFilterValue(recordFilter);

      if (options.length === 0) return;

      const emptyOptions = options.filter((option: string) => option === '');
      const nonEmptyOptions = options.filter((option: string) => option !== '');

      switch (recordFilter.operand) {
        case RecordFilterOperand.Is: {
          const conditions = [];

          if (nonEmptyOptions.length > 0) {
            conditions.push({
              [correspondingFieldMetadataItem.name]: {
                in: nonEmptyOptions,
              } as SelectFilter,
            });
          }

          if (emptyOptions.length > 0) {
            conditions.push({
              [correspondingFieldMetadataItem.name]: {
                is: 'NULL',
              } as SelectFilter,
            });
          }

          return conditions.length === 1 ? conditions[0] : { or: conditions };
        }
        case RecordFilterOperand.IsNot: {
          const conditions = [];

          if (nonEmptyOptions.length > 0) {
            conditions.push({
              not: {
                [correspondingFieldMetadataItem.name]: {
                  in: nonEmptyOptions,
                } as SelectFilter,
              },
            });
          }

          if (emptyOptions.length > 0) {
            conditions.push({
              not: {
                [correspondingFieldMetadataItem.name]: {
                  is: 'NULL',
                } as SelectFilter,
              },
            });
          }

          return conditions.length === 1 ? conditions[0] : { and: conditions };
        }
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'ARRAY': {
      switch (recordFilter.operand) {
        case RecordFilterOperand.Contains:
          return {
            [correspondingFieldMetadataItem.name]: {
              containsIlike: `%${recordFilter.value}%`,
            } as ArrayFilter,
          };
        case RecordFilterOperand.DoesNotContain:
          return {
            not: {
              [correspondingFieldMetadataItem.name]: {
                containsIlike: `%${recordFilter.value}%`,
              } as ArrayFilter,
            },
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'ACTOR': {
      if (subFieldName === 'source') {
        switch (recordFilter.operand) {
          case RecordFilterOperand.Is: {
            if (recordFilter.value === '[]') {
              return;
            }

            const parsedSources = JSON.parse(recordFilter.value) as string[];

            return {
              [correspondingFieldMetadataItem.name]: {
                source: {
                  in: parsedSources,
                } satisfies RelationFilter,
              },
            };
          }
          case RecordFilterOperand.IsNot: {
            if (recordFilter.value === '[]') {
              return;
            }

            const parsedSources = JSON.parse(recordFilter.value) as string[];

            if (parsedSources.length === 0) return;

            return {
              not: {
                [correspondingFieldMetadataItem.name]: {
                  source: {
                    in: parsedSources,
                  } satisfies RelationFilter,
                },
              },
            };
          }
          default:
            throw new Error(
              `Unknown operand ${recordFilter.operand} for ${recordFilter.label} filter`,
            );
        }
      }

      switch (recordFilter.operand) {
        case RecordFilterOperand.Contains:
          return {
            or: [
              {
                [correspondingFieldMetadataItem.name]: {
                  name: {
                    ilike: `%${recordFilter.value}%`,
                  },
                } satisfies ActorFilter,
              },
            ],
          };
        case RecordFilterOperand.DoesNotContain:
          return {
            and: [
              {
                not: {
                  [correspondingFieldMetadataItem.name]: {
                    name: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } satisfies ActorFilter,
                },
              },
            ],
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${recordFilter.label} filter`,
          );
      }
    }
    case 'EMAILS': {
      return computeGqlOperationFilterForEmails({
        correspondingFieldMetadataItem,
        recordFilter,
        subFieldName,
      });
    }
    case 'PHONES': {
      if (!isSubFieldFilter) {
        const filterValue = recordFilter.value.replace(/[^0-9]/g, '');

        if (!isNonEmptyString(filterValue)) {
          return;
        }

        switch (recordFilter.operand) {
          case RecordFilterOperand.Contains:
            return {
              or: [
                {
                  [correspondingFieldMetadataItem.name]: {
                    primaryPhoneNumber: {
                      ilike: `%${filterValue}%`,
                    },
                  } as PhonesFilter,
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    primaryPhoneCallingCode: {
                      ilike: `%${filterValue}%`,
                    },
                  } as PhonesFilter,
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    additionalPhones: {
                      like: `%${filterValue}%`,
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
                    [correspondingFieldMetadataItem.name]: {
                      primaryPhoneNumber: {
                        ilike: `%${filterValue}%`,
                      },
                    } as PhonesFilter,
                  },
                },
                {
                  not: {
                    [correspondingFieldMetadataItem.name]: {
                      primaryPhoneCallingCode: {
                        ilike: `%${filterValue}%`,
                      },
                    } as PhonesFilter,
                  },
                },
                {
                  or: [
                    {
                      not: {
                        [correspondingFieldMetadataItem.name]: {
                          additionalPhones: {
                            like: `%${filterValue}%`,
                          },
                        } as PhonesFilter,
                      },
                    },
                    {
                      [correspondingFieldMetadataItem.name]: {
                        additionalPhones: {
                          is: 'NULL',
                        } as PhonesFilter,
                      },
                    },
                  ],
                },
              ],
            };
          default:
            throw new Error(
              `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
            );
        }
      }

      const filterValue = recordFilter.value;

      switch (subFieldName) {
        case 'additionalPhones': {
          switch (recordFilter.operand) {
            case RecordFilterOperand.Contains:
              return {
                or: [
                  {
                    [correspondingFieldMetadataItem.name]: {
                      additionalPhones: {
                        like: `%${filterValue}%`,
                      },
                    } as PhonesFilter,
                  },
                ],
              };
            case RecordFilterOperand.DoesNotContain:
              return {
                or: [
                  {
                    not: {
                      [correspondingFieldMetadataItem.name]: {
                        additionalPhones: {
                          like: `%${filterValue}%`,
                        },
                      } as PhonesFilter,
                    },
                  },
                  {
                    [correspondingFieldMetadataItem.name]: {
                      additionalPhones: {
                        is: 'NULL',
                      } as PhonesFilter,
                    },
                  },
                ],
              };
            default:
              throw new Error(
                `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
              );
          }
        }
        case 'primaryPhoneNumber': {
          switch (recordFilter.operand) {
            case RecordFilterOperand.Contains:
              return {
                [correspondingFieldMetadataItem.name]: {
                  primaryPhoneNumber: {
                    ilike: `%${filterValue}%`,
                  },
                } as PhonesFilter,
              };
            case RecordFilterOperand.DoesNotContain:
              return {
                not: {
                  [correspondingFieldMetadataItem.name]: {
                    primaryPhoneNumber: {
                      ilike: `%${filterValue}%`,
                    },
                  } as PhonesFilter,
                },
              };
            default:
              throw new Error(
                `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
              );
          }
        }
        case 'primaryPhoneCallingCode': {
          switch (recordFilter.operand) {
            case RecordFilterOperand.Contains:
              return {
                [correspondingFieldMetadataItem.name]: {
                  primaryPhoneCallingCode: {
                    ilike: `%${filterValue}%`,
                  },
                } as PhonesFilter,
              };
            case RecordFilterOperand.DoesNotContain:
              return {
                not: {
                  [correspondingFieldMetadataItem.name]: {
                    primaryPhoneCallingCode: {
                      ilike: `%${filterValue}%`,
                    },
                  } as PhonesFilter,
                },
              };
            default:
              throw new Error(
                `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
              );
          }
        }
        default:
          throw new Error(
            `Unknown subfield ${subFieldName} for ${filterType} filter`,
          );
      }
    }
    case 'BOOLEAN': {
      return {
        [correspondingFieldMetadataItem.name]: {
          eq: recordFilter.value === 'true',
        } as BooleanFilter,
      };
    }
    default:
      throw new Error('Unknown filter type');
  }
};
