// Frozen at 2.62 so replaying the command never picks up later standard changes
export const NOT_STARTED_WORKFLOW_RUN_STATUS = 'NOT_STARTED';

export const ENQUEUED_WORKFLOW_RUN_STATUS_DEFAULT_VALUE = "'ENQUEUED'";

export const STOP_WORKFLOW_RUN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '4c186606-9515-4561-a1eb-9a072b4f5e58';

export const STOP_WORKFLOW_RUN_LEGACY_AVAILABILITY_EXPRESSION =
  'isSelectAll or someEquals(selectedRecords, "status", "NOT_STARTED") or someEquals(selectedRecords, "status", "ENQUEUED") or someEquals(selectedRecords, "status", "RUNNING")';

export const STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION =
  'isSelectAll or someEquals(selectedRecords, "status", "ENQUEUED") or someEquals(selectedRecords, "status", "RUNNING")';
