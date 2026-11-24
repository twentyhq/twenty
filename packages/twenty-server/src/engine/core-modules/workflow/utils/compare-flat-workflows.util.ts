import { isDefined } from 'twenty-shared/utils';

import {
  CoreWorkflowOrderByDirection,
  CoreWorkflowOrderByField,
} from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';

type SortableFlatWorkflow = Pick<FlatWorkflow, 'id' | 'name' | 'updatedAt'>;

const compareByOrderByField = ({
  orderBy,
  firstFlatWorkflow,
  secondFlatWorkflow,
}: {
  orderBy: CoreWorkflowOrderByField;
  firstFlatWorkflow: SortableFlatWorkflow;
  secondFlatWorkflow: SortableFlatWorkflow;
}): number => {
  if (orderBy === CoreWorkflowOrderByField.UPDATED_AT) {
    return (
      Date.parse(firstFlatWorkflow.updatedAt) -
      Date.parse(secondFlatWorkflow.updatedAt)
    );
  }

  return (firstFlatWorkflow.name ?? '').localeCompare(
    secondFlatWorkflow.name ?? '',
  );
};

export const compareFlatWorkflows =
  ({
    orderBy,
    orderByDirection,
  }: {
    orderBy: CoreWorkflowOrderByField;
    orderByDirection: CoreWorkflowOrderByDirection;
  }) =>
  (
    firstFlatWorkflow: SortableFlatWorkflow,
    secondFlatWorkflow: SortableFlatWorkflow,
  ): number => {
    const isFirstNameMissing =
      orderBy === CoreWorkflowOrderByField.NAME &&
      !isDefined(firstFlatWorkflow.name);
    const isSecondNameMissing =
      orderBy === CoreWorkflowOrderByField.NAME &&
      !isDefined(secondFlatWorkflow.name);

    if (isFirstNameMissing !== isSecondNameMissing) {
      return isFirstNameMissing ? 1 : -1;
    }

    const directionFactor =
      orderByDirection === CoreWorkflowOrderByDirection.ASC ? 1 : -1;

    return (
      directionFactor *
      (compareByOrderByField({
        orderBy,
        firstFlatWorkflow,
        secondFlatWorkflow,
      }) || firstFlatWorkflow.id.localeCompare(secondFlatWorkflow.id))
    );
  };
