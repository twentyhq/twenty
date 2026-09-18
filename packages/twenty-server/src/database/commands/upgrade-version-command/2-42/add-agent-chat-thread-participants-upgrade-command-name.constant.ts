// Referenced by @WasIntroducedInUpgrade on the participant entity and the
// "authorUserWorkspaceId" message column so pre-2.42 upgrade steps don't
// SELECT them before this command creates them.
export const ADD_AGENT_CHAT_THREAD_PARTICIPANTS_UPGRADE_COMMAND_NAME =
  '2.42.0_AddAgentChatThreadParticipantsFastInstanceCommand_1789728234972';
