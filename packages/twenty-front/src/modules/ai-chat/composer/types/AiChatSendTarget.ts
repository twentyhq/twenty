export type AiChatSendTarget = {
  threadId: string;
  instanceId?: string;
  onThreadChange: (threadId: string) => void;
};
