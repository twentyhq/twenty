import { isObject } from '@sniptt/guards';

export const isAiChatHandoffSkipped = () => {
  const historyState: unknown = window.history.state;

  return (
    isObject(historyState) &&
    'usr' in historyState &&
    isObject(historyState.usr) &&
    'isAiChatHandoffSkipped' in historyState.usr &&
    historyState.usr.isAiChatHandoffSkipped === true
  );
};
