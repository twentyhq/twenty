import { CoreWorkflowOrderByField } from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';

type SortableFlatWorkflow = Pick<FlatWorkflow, 'name' | 'updatedAt'>;

type CoreWorkflowKeysetSort = {
  getSortValue: (flatWorkflow: SortableFlatWorkflow) => string | null;
  compareSortValues: (
    firstSortValue: string,
    secondSortValue: string,
  ) => number;
};

export const getCoreWorkflowKeysetSort = (
  orderBy: CoreWorkflowOrderByField,
): CoreWorkflowKeysetSort => {
  if (orderBy === CoreWorkflowOrderByField.UPDATED_AT) {
    return {
      getSortValue: ({ updatedAt }) => updatedAt,
      compareSortValues: (firstSortValue, secondSortValue) =>
        Date.parse(firstSortValue) - Date.parse(secondSortValue),
    };
  }

  return {
    getSortValue: ({ name }) => name,
    compareSortValues: (firstSortValue, secondSortValue) =>
      firstSortValue.localeCompare(secondSortValue),
  };
};
