import {
  CompanyOrderByWithRelationInput,
  PersonOrderByWithRelationInput,
  StringFilter,
} from '../../generated/graphql';
import { Company } from '../../interfaces/entities/company.interface';
import { BoolExpType } from '../../interfaces/entities/generic.interface';
import { Person } from '../../interfaces/entities/person.interface';

function filterData<DataT>(
  data: Array<DataT>,
  where: BoolExpType<Company> | BoolExpType<Person>,
): Array<DataT> {
  return data.filter((item) => {
    // { firstname: {contains: '%string%' }}
    // { firstname: {equals: 'string' }}
    // { is: { company: { equals: 'string' }}}
    let isMatch: boolean = (
      Object.keys(where) as Array<keyof typeof where>
    ).every((key) => {
      if (!['OR', 'AND', 'NOT'].includes(key)) {
        const filterElement = where[key] as StringFilter & { is?: object };

        if (filterElement.is) {
          const nestedKey = Object.keys(filterElement.is)[0] as string;
          if (typeof item[key as keyof typeof item] === 'object') {
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
      }
      return false;
    });

    // { OR: [{ firstname: filter }, { lastname: filter }]
    if (where.OR && Array.isArray(where.OR)) {
      isMatch =
        isMatch ||
        where.OR.some((orFilter) =>
          filterData<DataT>(data, orFilter).includes(item),
        );
    }

    return isMatch;
  });
}

export function filterAndSortData<DataT>(
  data: Array<DataT>,
  where: BoolExpType<Company> | BoolExpType<Person>,
  orderBy: Array<
    PersonOrderByWithRelationInput & CompanyOrderByWithRelationInput
  >,
  limit: number,
): Array<DataT> {
  let filteredData = filterData<DataT>(data, where);

  if (orderBy) {
    const firstOrderBy = orderBy[0];

    const key = Object.keys(firstOrderBy)[0];

    filteredData.sort((itemA, itemB) => {
      const itemAValue = itemA[key as unknown as keyof typeof itemA];
      const itemBValue = itemB[key as unknown as keyof typeof itemB];
      if (!itemAValue || !itemBValue) {
        return 0;
      }

      if (typeof itemAValue === 'string' && typeof itemBValue === 'string') {
        return itemBValue.localeCompare(itemAValue);
      }
      return 0;
    });
  }

  if (limit) {
    filteredData = filteredData.slice(0, limit);
  }
  return filteredData;
}
