import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';

export const buildWorkflowRecordFromCoreWorkflow = (
  coreWorkflow: Pick<
    CoreWorkflow,
    | 'id'
    | 'name'
    | 'statuses'
    | 'visibility'
    | 'canChangeVisibility'
    | 'updatedAt'
  >,
): ObjectRecord => ({
  __typename: 'Workflow',
  id: coreWorkflow.id,
  name: coreWorkflow.name ?? '',
  statuses: coreWorkflow.statuses,
  visibility: coreWorkflow.visibility,
  canChangeVisibility: coreWorkflow.canChangeVisibility,
  updatedAt: coreWorkflow.updatedAt,
  deletedAt: null,
});
