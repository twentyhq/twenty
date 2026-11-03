const CORE_AGENTS_DELETE_DIALOG_PREFIX = 'core-agents-delete';

export const getCoreAgentsDeleteDialogId = (tableId: string) =>
  `${CORE_AGENTS_DELETE_DIALOG_PREFIX}-${tableId}`;
