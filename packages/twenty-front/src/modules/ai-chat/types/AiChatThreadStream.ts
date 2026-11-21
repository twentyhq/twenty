export type AiChatThreadStream = {
  refetchMessages: () => void;
  resync: () => void;
  dispose: () => void;
};
