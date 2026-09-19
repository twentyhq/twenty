// Referenced by @WasIntroducedInUpgrade on the channel entities and the
// "channelId" thread column so pre-2.42 upgrade steps don't SELECT them
// before this command creates them.
export const ADD_AGENT_CHAT_CHANNELS_UPGRADE_COMMAND_NAME =
  '2.42.0_AddAgentChatChannelsFastInstanceCommand_1789750766490';
