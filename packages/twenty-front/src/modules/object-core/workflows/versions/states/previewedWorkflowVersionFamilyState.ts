import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export type PreviewedWorkflowVersion = {
  coreWorkflowVersionId: string;
  workspaceWorkflowVersionId: string;
  label: string;
};

export type PreviewedWorkflowVersionFamilyStateKey = {
  workflowId: string;
};

export const previewedWorkflowVersionFamilyState = createAtomFamilyState<
  PreviewedWorkflowVersion | null,
  PreviewedWorkflowVersionFamilyStateKey
>({
  key: 'previewedWorkflowVersionFamilyState',
  defaultValue: null,
});
