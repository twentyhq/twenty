import { isDefined } from 'twenty-shared/utils';

import {
  CoreWorkflowOrderByDirection,
  CoreWorkflowOrderByField,
} from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { type CoreWorkflowCursor } from 'src/engine/core-modules/workflow/types/core-workflow-cursor.type';

const compareSortValues = ({
  orderBy,
  firstSortValue,
  secondSortValue,
}: {
  orderBy: CoreWorkflowOrderByField;
  firstSortValue: string;
  secondSortValue: string;
}): number =>
  orderBy === CoreWorkflowOrderByField.UPDATED_AT
    ? Date.parse(firstSortValue) - Date.parse(secondSortValue)
    : firstSortValue.localeCompare(secondSortValue);

export const compareCoreWorkflowCursors =
  ({
    orderBy,
    orderByDirection,
  }: {
    orderBy: CoreWorkflowOrderByField;
    orderByDirection: CoreWorkflowOrderByDirection;
  }) =>
  (
    firstCursor: CoreWorkflowCursor,
    secondCursor: CoreWorkflowCursor,
  ): number => {
    const { sortValue: firstSortValue } = firstCursor;
    const { sortValue: secondSortValue } = secondCursor;

    if (isDefined(firstSortValue) !== isDefined(secondSortValue)) {
      return isDefined(firstSortValue) ? -1 : 1;
    }

    const directionFactor =
      orderByDirection === CoreWorkflowOrderByDirection.ASC ? 1 : -1;

    const sortValueComparison =
      isDefined(firstSortValue) && isDefined(secondSortValue)
        ? compareSortValues({ orderBy, firstSortValue, secondSortValue })
        : 0;

    return (
      directionFactor *
      (sortValueComparison || firstCursor.id.localeCompare(secondCursor.id))
    );
  };
