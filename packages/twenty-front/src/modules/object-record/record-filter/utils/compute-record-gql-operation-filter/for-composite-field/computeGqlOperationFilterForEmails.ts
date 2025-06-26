import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  EmailsFilter,
  RecordGqlOperationFilter,
} from '@/object-record/graphql/types/RecordGqlOperationFilter';

import { CustomError } from '@/error-handler/CustomError';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { isNonEmptyString } from '@sniptt/guards';

export const computeGqlOperationFilterForEmails = ({
  recordFilter,
  correspondingFieldMetadataItem,
  subFieldName,
}: {
  recordFilter: RecordFilter;
  correspondingFieldMetadataItem: Pick<FieldMetadataItem, 'name' | 'type'>;
  subFieldName: CompositeFieldSubFieldName | null | undefined;
}): RecordGqlOperationFilter => {
  const isSubFieldFilter = isNonEmptyString(subFieldName);

  if (isSubFieldFilter) {
    switch (subFieldName) {
      case 'primaryEmail': {
        switch (recordFilter.operand) {
          case RecordFilterOperand.Contains:
            return {
              [correspondingFieldMetadataItem.name]: {
                primaryEmail: {
                  ilike: `%${recordFilter.value}%`,
                },
              } satisfies EmailsFilter,
            };
          case RecordFilterOperand.DoesNotContain:
            return {
              not: {
                [correspondingFieldMetadataItem.name]: {
                  primaryEmail: {
                    ilike: `%${recordFilter.value}%`,
                  },
                } satisfies EmailsFilter,
              },
            };
          default:
            throw new Error(
              `Unknown operand ${recordFilter.operand} for ${correspondingFieldMetadataItem.type} filter`,
            );
        }
      }
      case 'additionalEmails': {
        switch (recordFilter.operand) {
          case RecordFilterOperand.Contains:
            return {
              [correspondingFieldMetadataItem.name]: {
                additionalEmails: {
                  like: `%${recordFilter.value}%`,
                },
              } satisfies EmailsFilter,
            };
          case RecordFilterOperand.DoesNotContain:
            return {
              or: [
                {
                  not: {
                    [correspondingFieldMetadataItem.name]: {
                      additionalEmails: {
                        like: `%${recordFilter.value}%`,
                      },
                    } satisfies EmailsFilter,
                  },
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    additionalEmails: {
                      is: 'NULL',
                    },
                  } satisfies EmailsFilter,
                },
              ],
            };
          default:
            throw new CustomError(
              `Unknown operand ${recordFilter.operand} for ${correspondingFieldMetadataItem.type} filter`,
              'UNKNOWN_OPERAND_FOR_FILTER',
            );
        }
      }
      default: {
        throw new CustomError(
          `Unknown subfield name ${subFieldName}`,
          'UNKNOWN_SUBFIELD_NAME',
        );
      }
    }
  }

  switch (recordFilter.operand) {
    case RecordFilterOperand.Contains:
      return {
        or: [
          {
            [correspondingFieldMetadataItem.name]: {
              primaryEmail: {
                ilike: `%${recordFilter.value}%`,
              },
            } satisfies EmailsFilter,
          },
          {
            [correspondingFieldMetadataItem.name]: {
              additionalEmails: {
                like: `%${recordFilter.value}%`,
              },
            } satisfies EmailsFilter,
          },
        ],
      };
    case RecordFilterOperand.DoesNotContain:
      return {
        and: [
          {
            not: {
              [correspondingFieldMetadataItem.name]: {
                primaryEmail: {
                  ilike: `%${recordFilter.value}%`,
                },
              } satisfies EmailsFilter,
            },
          },
          {
            or: [
              {
                not: {
                  [correspondingFieldMetadataItem.name]: {
                    additionalEmails: {
                      like: `%${recordFilter.value}%`,
                    },
                  } satisfies EmailsFilter,
                },
              },
              {
                [correspondingFieldMetadataItem.name]: {
                  additionalEmails: {
                    is: 'NULL',
                  },
                } satisfies EmailsFilter,
              },
            ],
          },
        ],
      };
    default:
      throw new Error(
        `Unknown operand ${recordFilter.operand} for ${correspondingFieldMetadataItem.type} filter`,
      );
  }
};
