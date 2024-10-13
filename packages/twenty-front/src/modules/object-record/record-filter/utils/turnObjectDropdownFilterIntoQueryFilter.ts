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
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { applyEmptyFilters } from '@/object-record/record-filter/utils/applyEmptyFilters';
import { resolveFilterValue } from '@/views/utils/view-filter-value/resolveFilterValue';
import { endOfDay, roundToNearestMinutes, startOfDay } from 'date-fns';
import { z } from 'zod';

// TODO: break this down into smaller functions and make the whole thing immutable
// Especially applyEmptyFilters
export const turnObjectDropdownFilterIntoQueryFilter = (
  rawUIFilters: Filter[],
  fields: Pick<Field, 'id' | 'name'>[],
): RecordGqlOperationFilter | undefined => {
  const objectRecordFilters: RecordGqlOperationFilter[] = [];

  for (const rawUIFilter of rawUIFilters) {
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
      continue;
    }

    if (!isEmptyOperand) {
      if (!isDefined(rawUIFilter.value) || rawUIFilter.value === '') {
        continue;
      }
    }

    switch (rawUIFilter.definition.type) {
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
              rawUIFilter.definition,
            );
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
      case 'DATE':
      case 'DATE_TIME': {
        const resolvedFilterValue = resolveFilterValue(rawUIFilter);
        const now = roundToNearestMinutes(new Date());
        const date =
          resolvedFilterValue instanceof Date ? resolvedFilterValue : now;

        switch (rawUIFilter.operand) {
          case ViewFilterOperand.IsAfter: {
            objectRecordFilters.push({
              [correspondingField.name]: {
                gt: date.toISOString(),
              } as DateFilter,
            });
            break;
          }
          case ViewFilterOperand.IsBefore: {
            objectRecordFilters.push({
              [correspondingField.name]: {
                lt: date.toISOString(),
              } as DateFilter,
            });
            break;
          }
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty: {
            applyEmptyFilters(
              rawUIFilter.operand,
              correspondingField,
              objectRecordFilters,
              rawUIFilter.definition,
            );
            break;
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

            objectRecordFilters.push({
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
            });
            break;
          }
          case ViewFilterOperand.Is: {
            const isValid = resolvedFilterValue instanceof Date;
            const date = isValid ? resolvedFilterValue : now;

            objectRecordFilters.push({
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
            });
            break;
          }
          case ViewFilterOperand.IsInPast:
            objectRecordFilters.push({
              [correspondingField.name]: {
                lte: now.toISOString(),
              } as DateFilter,
            });
            break;
          case ViewFilterOperand.IsInFuture:
            objectRecordFilters.push({
              [correspondingField.name]: {
                gte: now.toISOString(),
              } as DateFilter,
            });
            break;
          case ViewFilterOperand.IsToday: {
            objectRecordFilters.push({
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
            });
            break;
          }
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`, //
            );
        }
        break;
      }
      case 'RATING':
        switch (rawUIFilter.operand) {
          case ViewFilterOperand.Is:
            objectRecordFilters.push({
              [correspondingField.name]: {
                eq: convertRatingToRatingValue(parseFloat(rawUIFilter.value)),
              } as StringFilter,
            });
            break;
          case ViewFilterOperand.GreaterThan:
            objectRecordFilters.push({
              [correspondingField.name]: {
                in: convertGreaterThanRatingToArrayOfRatingValues(
                  parseFloat(rawUIFilter.value),
                ),
              } as StringFilter,
            });
            break;
          case ViewFilterOperand.LessThan:
            objectRecordFilters.push({
              [correspondingField.name]: {
                in: convertLessThanRatingToArrayOfRatingValues(
                  parseFloat(rawUIFilter.value),
                ),
              } as StringFilter,
            });
            break;
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            applyEmptyFilters(
              rawUIFilter.operand,
              correspondingField,
              objectRecordFilters,
              rawUIFilter.definition,
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
              rawUIFilter.definition,
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
                rawUIFilter.definition,
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
              rawUIFilter.definition,
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
            if (!isCompositeFieldFiter) {
              objectRecordFilters.push({
                or: linksFilters,
              });
            } else {
              objectRecordFilters.push({
                [correspondingField.name]: {
                  [compositeFieldName]: {
                    ilike: `%${rawUIFilter.value}%`,
                  },
                },
              });
            }
            break;
          case ViewFilterOperand.DoesNotContain:
            if (!isCompositeFieldFiter) {
              objectRecordFilters.push({
                and: linksFilters.map((filter) => {
                  return {
                    not: filter,
                  };
                }),
              });
            } else {
              objectRecordFilters.push({
                not: {
                  [correspondingField.name]: {
                    [compositeFieldName]: {
                      ilike: `%${rawUIFilter.value}%`,
                    },
                  },
                },
              });
            }
            break;
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            applyEmptyFilters(
              rawUIFilter.operand,
              correspondingField,
              objectRecordFilters,
              rawUIFilter.definition,
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
            if (!isCompositeFieldFiter) {
              objectRecordFilters.push({
                or: fullNameFilters,
              });
            } else {
              objectRecordFilters.push({
                [correspondingField.name]: {
                  [compositeFieldName]: {
                    ilike: `%${rawUIFilter.value}%`,
                  },
                },
              });
            }
            break;
          case ViewFilterOperand.DoesNotContain:
            if (!isCompositeFieldFiter) {
              objectRecordFilters.push({
                and: fullNameFilters.map((filter) => {
                  return {
                    not: filter,
                  };
                }),
              });
            } else {
              objectRecordFilters.push({
                not: {
                  [correspondingField.name]: {
                    [compositeFieldName]: {
                      ilike: `%${rawUIFilter.value}%`,
                    },
                  },
                },
              });
            }
            break;
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            applyEmptyFilters(
              rawUIFilter.operand,
              correspondingField,
              objectRecordFilters,
              rawUIFilter.definition,
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
            if (!isCompositeFieldFiter) {
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
            } else {
              objectRecordFilters.push({
                [correspondingField.name]: {
                  [compositeFieldName]: {
                    ilike: `%${rawUIFilter.value}%`,
                  } as AddressFilter,
                },
              });
            }
            break;
          case ViewFilterOperand.DoesNotContain:
            if (!isCompositeFieldFiter) {
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
            } else {
              objectRecordFilters.push({
                not: {
                  [correspondingField.name]: {
                    [compositeFieldName]: {
                      ilike: `%${rawUIFilter.value}%`,
                    } as AddressFilter,
                  },
                },
              });
            }
            break;
          case ViewFilterOperand.IsEmpty:
          case ViewFilterOperand.IsNotEmpty:
            applyEmptyFilters(
              rawUIFilter.operand,
              correspondingField,
              objectRecordFilters,
              rawUIFilter.definition,
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
            rawUIFilter.definition,
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
      // TODO: fix this with a new composite field in ViewFilter entity
      case 'ACTOR': {
        switch (rawUIFilter.operand) {
          case ViewFilterOperand.Is: {
            const parsedRecordIds = JSON.parse(rawUIFilter.value) as string[];

            objectRecordFilters.push({
              [correspondingField.name]: {
                source: {
                  in: parsedRecordIds,
                } as RelationFilter,
              },
            });

            break;
          }
          case ViewFilterOperand.IsNot: {
            const parsedRecordIds = JSON.parse(rawUIFilter.value) as string[];

            if (parsedRecordIds.length > 0) {
              objectRecordFilters.push({
                not: {
                  [correspondingField.name]: {
                    source: {
                      in: parsedRecordIds,
                    } as RelationFilter,
                  },
                },
              });
            }
            break;
          }
          case ViewFilterOperand.Contains:
            objectRecordFilters.push({
              or: [
                {
                  [correspondingField.name]: {
                    name: {
                      ilike: `%${rawUIFilter.value}%`,
                    },
                  } as ActorFilter,
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
                      name: {
                        ilike: `%${rawUIFilter.value}%`,
                      },
                    } as ActorFilter,
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
              rawUIFilter.definition,
            );
            break;

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
            objectRecordFilters.push({
              or: [
                {
                  [correspondingField.name]: {
                    primaryEmail: {
                      ilike: `%${rawUIFilter.value}%`,
                    },
                  } as EmailsFilter,
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
                      primaryEmail: {
                        ilike: `%${rawUIFilter.value}%`,
                      },
                    } as EmailsFilter,
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
              rawUIFilter.definition,
            );
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
      case 'PHONES': {
        const phonesFilters = generateILikeFiltersForCompositeFields(
          rawUIFilter.value,
          correspondingField.name,
          ['primaryPhoneNumber', 'primaryPhoneCountryCode'],
        );
        switch (rawUIFilter.operand) {
          case ViewFilterOperand.Contains:
            objectRecordFilters.push({
              or: phonesFilters,
            });
            break;
          case ViewFilterOperand.DoesNotContain:
            objectRecordFilters.push({
              and: phonesFilters.map((filter) => {
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
              rawUIFilter.definition,
            );
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
      }
      default:
        throw new Error('Unknown filter type');
    }
  }

  return makeAndFilterVariables(objectRecordFilters);
};
