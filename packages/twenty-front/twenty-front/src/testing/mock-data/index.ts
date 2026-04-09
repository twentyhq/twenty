import {
  isArray,
  isNonEmptyString,
  isNumber,
  isObject,
  isString,
} from '@sniptt/guards';
import { type GraphQLVariables } from 'msw';
import { isDefined } from 'twenty-shared/utils';

type StringFilter = {
  equals?: string;
  contains?: string;
  in?: Array<string>;
  notIn?: Array<string>;
};

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

        if (isDefined(filterElement.is)) {
          const nestedKey = Object.keys(filterElement.is)[0] as string;
          if (
            item[key as keyof typeof item] &&
            isObject(item[key as keyof typeof item])
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
        if (isNonEmptyString(filterElement.equals)) {
          return item[key as keyof typeof item] === filterElement.equals;
        }
        if (isNonEmptyString(filterElement.contains)) {
          return (item[key as keyof typeof item] as string)
            .toLocaleLowerCase()
            .includes(
              filterElement.contains.replaceAll('%', '').toLocaleLowerCase(),
            );
        }
        if (isArray(filterElement.in)) {
          const itemValue = item[key as keyof typeof item] as string;

          return filterElement.in.includes(itemValue);
        }
        if (isArray(filterElement.notIn)) {
          const itemValue = item[key as keyof typeof item] as string;

          if (filterElement.notIn.length === 0) return true;

          return !filterElement.notIn.includes(itemValue);
        }
      }
      return false;
    });

    // { OR: [{ firstName: filter }, { lastName: filter }]
    if (isArray(where.OR)) {
      isMatch =
        isMatch ||
        where.OR.some((orFilter: any) =>
          filterData<DataT>(data, orFilter).includes(item),
        );
    }

    if (isArray(where.AND)) {
      isMatch =
        isMatch ||
        where.AND.every((andFilter: any) =>
          filterData<DataT>(data, andFilter).includes(item),
        );
    }

    return isMatch;
  });

export const filterAndSortData = <DataT>(
  data: Array<DataT>,
  where?: Record<string, any>,
  orderBy?: Array<any>,
  limit?: number,
): Array<DataT> => {
  let filteredData = data;

  if (isDefined(where)) {
    filteredData = filterData<DataT>(data, where);
  }

  if (isArray(orderBy) && orderBy.length > 0 && isDefined(orderBy[0])) {
    const firstOrderBy = orderBy?.[0];

    const key = Object.keys(firstOrderBy)[0];

    filteredData.sort((itemA, itemB) => {
      const itemAValue = itemA[key as unknown as keyof typeof itemA];
      const itemBValue = itemB[key as unknown as keyof typeof itemB];
      if (!itemAValue || !itemBValue) {
        return 0;
      }

      const sortDirection =
        firstOrderBy[key as unknown as keyof typeof firstOrderBy];
      if (isString(itemAValue) && isString(itemBValue)) {
        return sortDirection === 'desc'
          ? itemBValue.localeCompare(itemAValue)
          : -itemBValue.localeCompare(itemAValue);
      }
      return 0;
    });
  }

  if (isNumber(limit) && limit > 0) {
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
