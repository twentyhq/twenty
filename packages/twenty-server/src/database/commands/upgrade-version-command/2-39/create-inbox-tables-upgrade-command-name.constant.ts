// Referenced by @WasIntroducedInUpgrade on the inbox entities so upgrade steps
// running below 2.38.0 do not query the tables before this command creates
// them.
export const CREATE_INBOX_TABLES_UPGRADE_COMMAND_NAME =
  '2.39.0_CreateInboxTablesFastInstanceCommand_1788611057394';
