// Referenced by @WasIntroducedInUpgrade on PendingWakeUpEntity so upgrade
// steps running below 2.46.0 don't query the table before this command creates it.
export const CREATE_PENDING_WAKE_UP_TABLE_UPGRADE_COMMAND_NAME =
  '2.46.0_CreatePendingWakeUpTableFastInstanceCommand_1791299810581';
