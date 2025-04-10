import { GET_CHATBOT_FLOW_BY_ID } from '@/chatbot/graphql/query/getChatbotFlowById';
import { UpdateChatbotFlow } from '@/chatbot/types/chatbotFlow.type';
import { useQuery } from '@apollo/client';

type ChatbotFlowByIdReturn = {
  data: UpdateChatbotFlow | null;
  refetch: () => void;
};

export const useGetChatbotFlowById = (
  chatbotId: string,
): ChatbotFlowByIdReturn => {
  const { data: chatbotFlowData, refetch } = useQuery(GET_CHATBOT_FLOW_BY_ID, {
    variables: { chatbotId },
  });

  return {
    data: chatbotFlowData,
    refetch,
  };
};
