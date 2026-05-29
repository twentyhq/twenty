import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type WorkflowRun } from '@/workflow/types/Workflow';

type LatestWorkflowRun = {
  record: WorkflowRun;
  updatedAt: string;
};

export const latestWorkflowRunFamilyState = createAtomFamilyState<
  LatestWorkflowRun | undefined,
  string
>({
  key: 'latestWorkflowRunFamilyState',
  defaultValue: undefined,
});
