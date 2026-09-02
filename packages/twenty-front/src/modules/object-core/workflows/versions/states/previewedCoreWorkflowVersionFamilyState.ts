import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { type CoreWorkflowVersionStatus } from '~/generated/graphql';

export type PreviewedCoreWorkflowVersion = {
  coreWorkflowVersionId: string;
  label: string;
  status: CoreWorkflowVersionStatus;
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
  workspaceWorkflowVersionId: string;
};

export const previewedCoreWorkflowVersionFamilyState = createAtomFamilyState<
  PreviewedCoreWorkflowVersion | null,
  { workflowId: string }
>({
  key: 'previewedCoreWorkflowVersionFamilyState',
  defaultValue: null,
});
