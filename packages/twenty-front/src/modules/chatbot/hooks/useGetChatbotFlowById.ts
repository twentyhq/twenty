import { GET_CHATBOT_FLOW_BY_ID } from '@/chatbot/graphql/query/getChatbotFlowById';
import { chatbotFlowState } from '@/chatbot/state/chatbotFlowState';
import { UpdateChatbotFlow } from '@/chatbot/types/chatbotFlow.type';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type ChatbotFlowByIdReturn = {
  chatbotFlowData: UpdateChatbotFlow | null;
  refetch: () => void;
};

export const useGetChatbotFlowById = (
  chatbotId: string,
): ChatbotFlowByIdReturn => {
  const setChatbotFlow = useSetRecoilState(chatbotFlowState);
  const chatbotFlow = useRecoilValue(chatbotFlowState);

  const { data, refetch } = useQuery(GET_CHATBOT_FLOW_BY_ID, {
    variables: { chatbotId },
  });

  useEffect(() => {
    if (isDefined(data)) {
      setChatbotFlow(data.getChatbotFlowById);
    }
  }, [data]);

  return {
    chatbotFlowData: chatbotFlow,
    refetch,
  };
};
