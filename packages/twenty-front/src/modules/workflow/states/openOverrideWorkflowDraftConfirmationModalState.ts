import { createState } from 'twenty-ui';

export const openOverrideWorkflowDraftConfirmationModalState =
  createState<boolean>({
    key: 'openOverrideWorkflowDraftConfirmationModalState',
    defaultValue: false,
  });
