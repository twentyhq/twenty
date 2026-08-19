import { isDefined } from 'twenty-shared/utils';

import {
  type ObjectRecordCursorLeafCompositeValue,
  type ObjectRecordCursorLeafScalarValue,
  type ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

type BuildCursorConditionParams<CursorValue> = {
  cursorKey: string;
  cursorValue: CursorValue;
};

type ReturnType = Array<ObjectRecordFilter | { and: ObjectRecordFilter[] }>;

type CursorEntry<CursorValue> = Record<string, CursorValue>;

type BuildCursorCumulativeWhereConditionsParams<CursorValue> = {
  cursorEntries: CursorEntry<CursorValue>[];
  buildEqualityCondition: ({
    cursorKey,
    cursorValue,
  }: BuildCursorConditionParams<CursorValue>) => ObjectRecordFilter;
  buildMainCondition: ({
    cursorKey,
    cursorValue,
  }: BuildCursorConditionParams<CursorValue>) => ObjectRecordFilter | null;
};

export const buildCursorCumulativeWhereCondition = <
  CursorValue extends
    | ObjectRecordCursorLeafCompositeValue
    | ObjectRecordCursorLeafScalarValue,
>({
  cursorEntries,
  buildEqualityCondition,
  buildMainCondition,
}: BuildCursorCumulativeWhereConditionsParams<CursorValue>): ReturnType => {
  // Each equality condition is reused by every later branch: compute them once
  const equalityConditions = cursorEntries.map((cursorEntry) => {
    const [cursorKey, cursorValue] = Object.entries(cursorEntry)[0];

    return buildEqualityCondition({ cursorKey, cursorValue });
  });

  return cursorEntries.flatMap((cursorEntry, index) => {
    const [currentCursorKey, currentCursorValue] =
      Object.entries(cursorEntry)[0];

    const mainCondition = buildMainCondition({
      cursorKey: currentCursorKey,
      cursorValue: currentCursorValue,
    });

    // A null main condition means no row can sort strictly after the cursor on
    // this key alone (e.g. inside a trailing NULL block): only the tie-breaking
    // keys of the following branches can advance the scan
    if (!isDefined(mainCondition)) {
      return [];
    }

    const andConditions = [
      ...equalityConditions.slice(0, index),
      mainCondition,
    ];

    if (andConditions.length === 1) {
      return [andConditions[0]];
    }

    return [
      {
        and: andConditions,
      },
    ];
  });
};
