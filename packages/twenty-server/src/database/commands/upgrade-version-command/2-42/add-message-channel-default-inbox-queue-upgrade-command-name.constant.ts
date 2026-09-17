// Referenced by @WasIntroducedInUpgrade on MessageChannelEntity so upgrade
// steps running below 2.41.0 do not select the column before this command adds
// it.
export const ADD_MESSAGE_CHANNEL_DEFAULT_INBOX_QUEUE_UPGRADE_COMMAND_NAME =
  '2.42.0_AddMessageChannelDefaultInboxQueueFastInstanceCommand_1789654380000';
