import {
  ObjectRecordCursorLeafCompositeValue,
  ObjectRecordCursorLeafScalarValue,
  ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

type BuildCursorConditionParams<CursorValue> = {
  cursorKey: string;
  cursorValue: CursorValue;
};

type ReturnType = Array<ObjectRecordFilter | { and: ObjectRecordFilter[] }>;

export const buildCumulativeConditions = <
  CursorValue extends
    | ObjectRecordCursorLeafCompositeValue
    | ObjectRecordCursorLeafScalarValue,
>({
  items,
  buildEqualityCondition,
  buildMainCondition,
}: {
  items: Record<string, CursorValue>[];
  buildEqualityCondition: ({
    cursorKey,
    cursorValue,
  }: BuildCursorConditionParams<CursorValue>) => ObjectRecordFilter;
  buildMainCondition: ({
    cursorKey,
    cursorValue,
  }: BuildCursorConditionParams<CursorValue>) => ObjectRecordFilter;
}): ReturnType => {
  return items.map((item, index) => {
    const [currentCursorKey, currentCursorValue] = Object.entries(item)[0];
    const andConditions: ObjectRecordFilter[] = [];

    for (
      let subConditionIndex = 0;
      subConditionIndex < index;
      subConditionIndex++
    ) {
      const previousItem = items[subConditionIndex];
      const [previousCursorKey, previousCursorValue] =
        Object.entries(previousItem)[0];

      andConditions.push(
        buildEqualityCondition({
          cursorKey: previousCursorKey,
          cursorValue: previousCursorValue,
        }),
      );
    }

    andConditions.push(
      buildMainCondition({
        cursorKey: currentCursorKey,
        cursorValue: currentCursorValue,
      }),
    );

    if (andConditions.length === 1) {
      return andConditions[0];
    }

    return {
      and: andConditions,
    };
  });
};
