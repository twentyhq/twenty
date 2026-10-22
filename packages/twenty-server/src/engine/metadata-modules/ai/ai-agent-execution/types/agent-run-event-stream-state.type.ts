export type AgentRunEventStreamState = {
  threadId: string;
  // the reply streaming in the conversation and its turn, named by its start chunk
  messageId: string | null;
  turnId: string | null;
  textParts: Record<string, { index: number; text: string }>;
  textPartCount: number;
  // chunks a replay already covered, which the live stream sends again
  skipChunksUpToSeq: number;
};
