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
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { applyEmptyFilters } from '@/object-record/record-filter/utils/applyEmptyFilters';
import {
  getAddressSubField,
  getFullNameSubField,
  getLinkSubField,
} from '@/object-record/record-filter/utils/getCorrespondingSubfieldFromLabel';
import { Filter } from '../../object-filter-dropdown/types/Filter';

export type ObjectDropdownFilterDefinition = FilterDefinition & {
  type: FilterType;
  label?: string;
};

export type ObjectDropdownFilter = Omit<Filter, 'definition'> & {
  definition: ObjectDropdownFilterDefinition;
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
              rawUIFilter.definition,
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
              rawUIFilter.definition,
            );
            break;
          default:
            throw new Error(
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
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
            if (rawUIFilter.definition.isSubField === false) {
              objectRecordFilters.push({
                or: linksFilters,
              });
            } else {
              objectRecordFilters.push({
                [correspondingField.name]: {
                  [getLinkSubField(rawUIFilter.definition.label ?? '')]: {
                    ilike: `%${rawUIFilter.value}%`,
                  },
                },
              });
            }
            break;
          case ViewFilterOperand.DoesNotContain:
            if (rawUIFilter.definition.isSubField === false) {
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
                    [getLinkSubField(rawUIFilter.definition.label ?? '')]: {
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
            if (rawUIFilter.definition.isSubField === false) {
              objectRecordFilters.push({
                or: fullNameFilters,
              });
            } else {
              objectRecordFilters.push({
                [correspondingField.name]: {
                  [getFullNameSubField(rawUIFilter.definition.label ?? '')]: {
                    ilike: `%${rawUIFilter.value}%`,
                  },
                },
              });
            }
            break;
          case ViewFilterOperand.DoesNotContain:
            if (rawUIFilter.definition.isSubField === false) {
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
                    [getFullNameSubField(rawUIFilter.definition.label ?? '')]: {
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
            if (rawUIFilter.definition.isSubField === false) {
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
                  [getAddressSubField(rawUIFilter.definition.label ?? '')]: {
                    ilike: `%${rawUIFilter.value}%`,
                  } as AddressFilter,
                },
              });
            }
            break;
          case ViewFilterOperand.DoesNotContain:
            if (rawUIFilter.definition.isSubField === false) {
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
                    [getAddressSubField(rawUIFilter.definition.label ?? '')]: {
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
      case 'ACTOR':
        switch (rawUIFilter.operand) {
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
              `Unknown operand ${rawUIFilter.operand} for ${rawUIFilter.definition.type} filter`,
            );
        }
        break;
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
      default:
        throw new Error('Unknown filter type');
    }
  }

  return makeAndFilterVariables(objectRecordFilters);
};
