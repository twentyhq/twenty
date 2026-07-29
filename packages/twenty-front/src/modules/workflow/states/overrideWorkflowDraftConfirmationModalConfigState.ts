import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type OverrideWorkflowDraftConfirmationModalConfig = {
  workflowId: string;
  workflowVersionIdToCopy: string;
};

export const overrideWorkflowDraftConfirmationModalConfigState =
  createAtomState<OverrideWorkflowDraftConfirmationModalConfig | null>({
    key: 'overrideWorkflowDraftConfirmationModalConfigState',
    defaultValue: null,
  });
