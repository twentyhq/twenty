// Referenced by @WasIntroducedInUpgrade on the "pendingQuestionMessageId"
// column so pre-2.19 upgrade steps don't SELECT it before this command adds it.
export const ADD_PENDING_QUESTION_MESSAGE_ID_TO_AGENT_CHAT_THREAD_UPGRADE_COMMAND_NAME =
  '2.19.0_AddPendingQuestionMessageIdToAgentChatThreadFastInstanceCommand_1782999138000';
