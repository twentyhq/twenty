import { FieldMetadataType } from 'twenty-shared/types';

import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { computeOperator } from 'src/engine/api/utils/compute-operator.utils';
import { isAscendingOrder } from 'src/engine/api/utils/is-ascending-order.utils';

export const buildLexicographicOrderingWhereCondition = (
  filteredProperties: Array<{ name: string; type: FieldMetadataType }>,
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keyOrderBy: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: { [key: string]: any },
  isForwardPagination: boolean,
  operator?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { [key: string]: any } => {
  if (filteredProperties.length === 0) {
    return {};
  }

  if (filteredProperties.length === 1) {
    const property = filteredProperties[0];
    const isAscending = isAscendingOrder(keyOrderBy[key][property.name]);
    const computedOperator = computeOperator(
      isAscending,
      isForwardPagination,
      operator,
    );

    return {
      [key]: {
        [property.name]: {
          [computedOperator]: value[property.name],
        },
      },
    };
  }

  const orConditions: Partial<ObjectRecordFilter>[] = [];

  for (const [index, currentProperty] of filteredProperties.entries()) {
    const isAscending = isAscendingOrder(keyOrderBy[key][currentProperty.name]);

    const computedOperator = computeOperator(
      isAscending,
      isForwardPagination,
      operator,
    );

    if (index === 0) {
      orConditions.push({
        [key]: {
          [currentProperty.name]: {
            [computedOperator]: value[currentProperty.name],
          },
        },
      });
    } else {
      const andConditions: Partial<ObjectRecordFilter>[] = [];

      const previousProperties = filteredProperties.slice(0, index);

      for (const previousProperty of previousProperties) {
        andConditions.push({
          [key]: {
            [previousProperty.name]: {
              eq: value[previousProperty.name],
            },
          },
        });
      }

      andConditions.push({
        [key]: {
          [currentProperty.name]: {
            [computedOperator]: value[currentProperty.name],
          },
        },
      });

      orConditions.push({
        and: andConditions,
      });
    }
  }

  return {
    or: orConditions,
  };
};
