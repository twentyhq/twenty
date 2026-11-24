import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';

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
  canChangeVisibility: coreWorkflow.canChangeVisibility,
  updatedAt: coreWorkflow.updatedAt,
  deletedAt: null,
});
