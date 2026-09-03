// Referenced by @WasIntroducedInUpgrade on InboxItemToolCallEntity so upgrade
// steps running below 2.38.0 do not query the table before this command
// creates it.
export const ADD_INBOX_ITEM_TOOL_CALLS_UPGRADE_COMMAND_NAME =
  '2.38.0_AddInboxItemToolCallsFastInstanceCommand_1788435600000';
