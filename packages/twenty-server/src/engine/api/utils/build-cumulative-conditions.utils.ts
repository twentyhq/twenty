import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export const buildCumulativeConditions = <
  T,
  R extends ObjectRecordFilter | { and: ObjectRecordFilter[] },
>({
  items,
  buildEqualityCondition,
  buildMainCondition,
}: {
  items: T[];
  buildEqualityCondition: (item: T, index: number) => ObjectRecordFilter;
  buildMainCondition: (item: T, index: number) => ObjectRecordFilter;
}): R[] => {
  return items.map((item, index) => {
    const andConditions: ObjectRecordFilter[] = [];

    for (
      let subConditionIndex = 0;
      subConditionIndex < index;
      subConditionIndex++
    ) {
      const previousItem = items[subConditionIndex];

      andConditions.push(
        buildEqualityCondition(previousItem, subConditionIndex),
      );
    }

    andConditions.push(buildMainCondition(item, index));

    if (andConditions.length === 1) {
      return andConditions[0];
    }

    return {
      and: andConditions,
    };
  }) as R[];
};
