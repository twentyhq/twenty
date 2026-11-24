import { CoreWorkflowOrderByField } from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';

type SortableFlatWorkflow = Pick<FlatWorkflow, 'name' | 'updatedAt'>;

export const getCoreWorkflowKeysetSort = (
  orderBy: CoreWorkflowOrderByField,
): {
  getSortValue: (flatWorkflow: SortableFlatWorkflow) => string | null;
  compareSortValues: (
    firstSortValue: string,
    secondSortValue: string,
  ) => number;
} =>
  orderBy === CoreWorkflowOrderByField.UPDATED_AT
    ? {
        getSortValue: ({ updatedAt }) => updatedAt,
        compareSortValues: (firstSortValue, secondSortValue) =>
          Date.parse(firstSortValue) - Date.parse(secondSortValue),
      }
    : {
        getSortValue: ({ name }) => name,
        compareSortValues: (firstSortValue, secondSortValue) =>
          firstSortValue.localeCompare(secondSortValue),
      };
