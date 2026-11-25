export const NOT_STARTED_WORKFLOW_RUN_STATUS_OPTION = {
  id: '20202020-2ec6-40d8-b9e1-1b1e567bcca9',
  value: 'NOT_STARTED',
  label: 'Not started',
  position: 0,
  color: 'gray' as const,
};

export const NOT_STARTED_WORKFLOW_RUN_STATUS_DEFAULT_VALUE = "'NOT_STARTED'";

export const STOP_WORKFLOW_RUN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '4c186606-9515-4561-a1eb-9a072b4f5e58';

export const STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION_WITHOUT_NOT_STARTED =
  'isSelectAll or someEquals(selectedRecords, "status", "ENQUEUED") or someEquals(selectedRecords, "status", "RUNNING")';

export const STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION =
  'isSelectAll or someEquals(selectedRecords, "status", "NOT_STARTED") or someEquals(selectedRecords, "status", "ENQUEUED") or someEquals(selectedRecords, "status", "RUNNING")';
