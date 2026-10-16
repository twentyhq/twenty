import { type AgentRunEvent } from 'twenty-shared/application';

export const buildAgentRunMessageEvent = ({
  messageId,
  role,
  textIndex,
  text,
}: {
  messageId: string;
  role: 'user' | 'assistant';
  textIndex: number;
  text: string;
}): AgentRunEvent => {
  const id = `${messageId}:text:${textIndex}`;
  const content = [{ type: 'text' as const, text }];

  return role === 'user'
    ? { id, type: 'user.message', content }
    : { id, type: 'agent.message', content };
};
