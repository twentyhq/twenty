// Referenced by @WasIntroducedInUpgrade on InboxItemTypeEntity and
// InboxItemEntity so upgrade steps running below 2.30.0 do not query the tables
// before this command creates them.
export const CREATE_INBOX_CORE_TABLES_UPGRADE_COMMAND_NAME =
  '2.30.0_CreateInboxCoreTablesFastInstanceCommand_1786360664857';
