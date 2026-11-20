export type AiChatReplyStatus =
  | 'idle'
  | 'awaiting-first-chunk'
  | 'streaming'
  | 'awaiting-persisted-refetch';
