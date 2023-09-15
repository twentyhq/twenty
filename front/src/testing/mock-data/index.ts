import { GraphQLVariables } from 'msw';

import {
  CompanyOrderByWithRelationInput,
  PersonOrderByWithRelationInput,
  StringFilter,
  UserOrderByWithRelationInput,
} from '~/generated/graphql';

import { isDefined } from '../../utils/isDefined';

const filterData = <DataT>(
  data: Array<DataT>,
  where: Record<string, any>,
): Array<DataT> =>
  data.filter((item) => {
    // { firstName: {contains: '%string%' }}
    // { lastName: {equals: 'string' }}
    // { is: { company: { equals: 'string' }}}
    let isMatch: boolean = (
      Object.keys(where) as Array<keyof typeof where>
    ).every((key) => {
      if (!['OR', 'AND', 'NOT'].includes(key)) {
        const filterElement = where[key] as StringFilter & { is?: object };

        if (filterElement.is) {
          const nestedKey = Object.keys(filterElement.is)[0] as string;
          if (
            item[key as keyof typeof item] &&
            typeof item[key as keyof typeof item] === 'object'
          ) {
            const nestedItem = item[key as keyof typeof item];
            return (
              nestedItem[nestedKey as keyof typeof nestedItem] ===
              (
                filterElement.is[
                  nestedKey as keyof typeof filterElement.is
                ] as StringFilter
              ).equals
            );
          }
        }
        if (filterElement.equals) {
          return item[key as keyof typeof item] === filterElement.equals;
        }
        if (filterElement.contains) {
          return (item[key as keyof typeof item] as string)
            .toLocaleLowerCase()
            .includes(
              filterElement.contains.replaceAll('%', '').toLocaleLowerCase(),
            );
        }
        if (filterElement.in) {
          const itemValue = item[key as keyof typeof item] as string;

          return filterElement.in.includes(itemValue);
        }
        if (filterElement.notIn) {
          const itemValue = item[key as keyof typeof item] as string;

          if (filterElement.notIn.length === 0) return true;

          return !filterElement.notIn.includes(itemValue);
        }
      }
      return false;
    });

    // { OR: [{ firstName: filter }, { lastName: filter }]
    if (where.OR && Array.isArray(where.OR)) {
      isMatch =
        isMatch ||
        where.OR.some((orFilter) =>
          filterData<DataT>(data, orFilter).includes(item),
        );
    }

    if (where.AND && Array.isArray(where.AND)) {
      isMatch =
        isMatch ||
        where.AND.every((andFilter) =>
          filterData<DataT>(data, andFilter).includes(item),
        );
    }

    return isMatch;
  });

export const filterAndSortData = <DataT>(
  data: Array<DataT>,
  where?: Record<string, any>,
  orderBy?: Array<
    PersonOrderByWithRelationInput &
      CompanyOrderByWithRelationInput &
      UserOrderByWithRelationInput
  >,
  limit?: number,
): Array<DataT> => {
  let filteredData = data;

  if (where) {
    filteredData = filterData<DataT>(data, where);
  }

  if (orderBy && Array.isArray(orderBy) && orderBy.length > 0 && orderBy[0]) {
    const firstOrderBy = orderBy[0];

    const key = Object.keys(firstOrderBy)[0];

    filteredData.sort((itemA, itemB) => {
      const itemAValue = itemA[key as unknown as keyof typeof itemA];
      const itemBValue = itemB[key as unknown as keyof typeof itemB];
      if (!itemAValue || !itemBValue) {
        return 0;
      }

      const sortDirection =
        firstOrderBy[key as unknown as keyof typeof firstOrderBy];
      if (typeof itemAValue === 'string' && typeof itemBValue === 'string') {
        return sortDirection === 'desc'
          ? itemBValue.localeCompare(itemAValue)
          : -itemBValue.localeCompare(itemAValue);
      }
      return 0;
    });
  }

  if (limit) {
    filteredData = filteredData.slice(0, limit);
  }

  return filteredData;
};

export const fetchOneFromData = <DataT extends { id: string }>(
  data: Array<DataT>,
  id: string,
): DataT | undefined => {
  if (!isDefined(id)) {
    throw new Error(
      `id is not defined in updateOneFromData, check that you provided where.id if needed.`,
    );
  }

  return data.filter((item) => item.id === id)[0];
};

export const updateOneFromData = <DataT extends { id: string }>(
  data: Array<DataT>,
  id: string | undefined,
  payload: GraphQLVariables,
): DataT | undefined => {
  if (!isDefined(id)) {
    throw new Error(
      `id is not defined in updateOneFromData, check that you provided where.id if needed.`,
    );
  }

  const object = data.filter((item) => item.id === id)[0];

  const newObject = Object.assign(object, payload);

  return newObject;
};
