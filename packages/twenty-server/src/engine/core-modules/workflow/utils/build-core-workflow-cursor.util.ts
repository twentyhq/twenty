import { CoreWorkflowOrderByField } from 'src/engine/core-modules/workflow/dtos/core-workflows.input';
import { type CoreWorkflowCursor } from 'src/engine/core-modules/workflow/types/core-workflow-cursor.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';

export const buildCoreWorkflowCursor = ({
  flatWorkflow,
  orderBy,
}: {
  flatWorkflow: Pick<FlatWorkflow, 'id' | 'name' | 'updatedAt'>;
  orderBy: CoreWorkflowOrderByField;
}): CoreWorkflowCursor => ({
  sortValue:
    orderBy === CoreWorkflowOrderByField.UPDATED_AT
      ? flatWorkflow.updatedAt
      : flatWorkflow.name,
  id: flatWorkflow.id,
});
