import { BotDiagramBase } from '@/chatbot/components/BotDiagramBase';
import CondicionalNode from '@/chatbot/components/ui/CondicionalNode';
import TextNode from '@/chatbot/components/ui/TextNode';
import { useGetChatbot } from '@/chatbot/hooks/useGetChatbot';
import { chatbotStatusTagProps } from '@/chatbot/utils/chatbotStatusTagProps';
import { NodeTypes, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface TargetableObject {
  id: string;
  targetObjectNameSingular: string;
}

const types: NodeTypes = {
  textInput: TextNode,
  logicInput: CondicionalNode,
};

export const ChatbotFlow = ({
  targetableObject,
}: {
  targetableObject: TargetableObject;
}) => {
  const { chatbot, refetch } = useGetChatbot(targetableObject.id);

  const status = chatbot?.statuses ?? 'DEACTIVATED';

  if (!status) return;

  const tagProps = chatbotStatusTagProps({
    chatbotStatus: status,
  });

  refetch();

  // Enter the types of nodes and edges here in BotDiagramBase
  return (
    <ReactFlowProvider>
      <BotDiagramBase
        nodeTypes={types}
        tagColor={tagProps.color}
        tagText={tagProps.text}
        chatbotId={chatbot?.id ? chatbot.id : ''}
      />
    </ReactFlowProvider>
  );
};
