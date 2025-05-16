import { GET_CHATBOTS } from '@/chatbot/graphql/query/getChatbots';
import { useQuery } from '@apollo/client';
import { Query } from '~/generated/graphql';

export const useGetChatbot = (targetableObjectId: string) => {
  const { data, refetch } = useQuery<Pick<Query, 'getChatbots'>>(GET_CHATBOTS);

  const findChatbot = data?.getChatbots?.find(
    (bot) => bot.id === targetableObjectId,
  );

  return {
    chatbot: findChatbot,
    refetch,
  };
};
