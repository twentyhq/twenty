import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';

export const isTeamsChatEnabled = (): boolean =>
  process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] === 'true';
