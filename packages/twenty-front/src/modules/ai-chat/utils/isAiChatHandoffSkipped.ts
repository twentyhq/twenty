import { isObject } from '@sniptt/guards';

export const isAiChatHandoffSkipped = (historyState: unknown) =>
  isObject(historyState) &&
  'isAiChatHandoffSkipped' in historyState &&
  historyState.isAiChatHandoffSkipped === true;
