// Referenced by @WasIntroducedInUpgrade on the inbox entities so upgrade steps
// running below 2.41.0 do not query the tables before this command creates
// them.
export const CREATE_INBOX_TABLES_UPGRADE_COMMAND_NAME =
  '2.42.0_CreateInboxTablesFastInstanceCommand_1789654320000';
