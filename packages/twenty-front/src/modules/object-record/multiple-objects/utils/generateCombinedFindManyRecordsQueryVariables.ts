import { type RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { isNonEmptyString } from '@sniptt/guards';
import { capitalize, isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const generateCombinedFindManyRecordsQueryVariables = ({
  operationSignatures,
}: {
  operationSignatures: RecordGqlOperationSignature[];
}) => {
  if (!isNonEmptyArray(operationSignatures)) {
    return {};
  }

  return operationSignatures.reduce(
    (acc, { objectNameSingular, variables }) => {
      const capitalizedName = capitalize(objectNameSingular);

      const filter = isDefined(variables?.filter)
        ? { [`filter${capitalizedName}`]: variables.filter }
        : {};

      const orderBy = isDefined(variables?.orderBy)
        ? { [`orderBy${capitalizedName}`]: variables.orderBy }
        : {};

      let limit = {};

      const hasLimit = isDefined(variables.limit) && variables.limit > 0;

      const cursorDirection = variables.cursorFilter?.cursorDirection;

      let cursorFilter = {};

      if (isNonEmptyString(variables.cursorFilter?.cursor)) {
        if (cursorDirection === 'after') {
          cursorFilter = {
            [`after${capitalizedName}`]: variables.cursorFilter?.cursor,
          };

          if (hasLimit) {
            cursorFilter = {
              ...cursorFilter,
              [`first${capitalizedName}`]: variables.limit,
            };
          }
        } else if (cursorDirection === 'before') {
          cursorFilter = {
            [`before${capitalizedName}`]: variables.cursorFilter?.cursor,
          };

          if (hasLimit) {
            cursorFilter = {
              ...cursorFilter,
              [`last${capitalizedName}`]: variables.limit,
            };
          }
        }
      } else if (hasLimit) {
        limit = {
          [`limit${capitalizedName}`]: variables.limit,
        };
      }

      return {
        ...acc,
        ...filter,
        ...orderBy,
        ...limit,
        ...cursorFilter,
      };
    },
    {},
  );
};
