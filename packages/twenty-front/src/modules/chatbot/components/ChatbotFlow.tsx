/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { BotDiagramBase } from '@/chatbot/components/BotDiagramBase';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export const ChatbotFlow = (targetableObject: any) => {
  console.log('targetableObject: ', targetableObject);
  // const { objectRecordId } = useParams<{ objectRecordId?: string }>();

  // const { chatbotFlow } = useValidateChatbotFlow();
  // const { updateFlow } = useUpdateChatbotFlow();

  // Enter the types of nodes and edges here in BotDiagramBase
  return (
    <ReactFlowProvider>
      <BotDiagramBase />
    </ReactFlowProvider>
  );
};
