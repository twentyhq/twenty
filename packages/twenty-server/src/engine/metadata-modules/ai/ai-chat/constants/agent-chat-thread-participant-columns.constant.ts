import { AGENT_CHAT_THREAD_PARTICIPANT_COLUMN_NAMES } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participant-column-names.constant';

export const AGENT_CHAT_THREAD_PARTICIPANT_COLUMNS =
  AGENT_CHAT_THREAD_PARTICIPANT_COLUMN_NAMES.map(
    (columnName) => `"${columnName}"`,
  ).join(', ');
