import { AgentChatProviderContent } from '@/ai/components/AgentChatProviderContent';

export const AgentChatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <AgentChatProviderContent>{children}</AgentChatProviderContent>;
};
