import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { WorkflowVisibility } from '~/generated/graphql';

export const buildWorkflowRecordFromCoreWorkflow = (
  coreWorkflow: Pick<
    CoreWorkflow,
    | 'id'
    | 'name'
    | 'statuses'
    | 'isPrivate'
    | 'canChangeVisibility'
    | 'updatedAt'
  >,
): ObjectRecord => ({
  __typename: 'Workflow',
  id: coreWorkflow.id,
  name: coreWorkflow.name ?? '',
  statuses: coreWorkflow.statuses,
  isPrivate: coreWorkflow.isPrivate,
  visibility: coreWorkflow.isPrivate
    ? WorkflowVisibility.PRIVATE
    : WorkflowVisibility.WORKSPACE,
  canChangeVisibility: coreWorkflow.canChangeVisibility,
  updatedAt: coreWorkflow.updatedAt,
  deletedAt: null,
});
