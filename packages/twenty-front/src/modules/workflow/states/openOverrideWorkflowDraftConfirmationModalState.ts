import { createState } from "twenty-shared";

export const openOverrideWorkflowDraftConfirmationModalState =
  createState<boolean>({
    key: 'openOverrideWorkflowDraftConfirmationModalState',
    defaultValue: false,
  });
