import { BotDiagramBase } from '@/chatbot/components/BotDiagramBase';
import { useGetChatbot } from '@/chatbot/hooks/useGetChatbot';
import { chatbotStatusTagProps } from '@/chatbot/utils/chatbotStatusTagProps';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface TargetableObject {
  id: string;
  targetObjectNameSingular: string;
}

export const ChatbotFlow = ({
  targetableObject,
}: {
  targetableObject: TargetableObject;
}) => {
  const { chatbot, refetch } = useGetChatbot(targetableObject.id);
  // const { chatbotFlow } = useValidateChatbotFlow();
  // const { updateFlow } = useUpdateChatbotFlow();

  const status = chatbot?.statuses ?? 'DEACTIVATED';

  if (!status) return;

  const tagProps = chatbotStatusTagProps({
    chatbotStatus: status,
  });

  refetch();

  // Enter the types of nodes and edges here in BotDiagramBase
  return (
    <ReactFlowProvider>
      <BotDiagramBase tagColor={tagProps.color} tagText={tagProps.text} />
    </ReactFlowProvider>
  );
};
