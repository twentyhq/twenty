import { createState } from '@ui/utilities/state/utils/createState';

export const openOverrideWorkflowDraftConfirmationModalState =
  createState<boolean>({
    key: 'openOverrideWorkflowDraftConfirmationModalState',
    defaultValue: false,
  });
