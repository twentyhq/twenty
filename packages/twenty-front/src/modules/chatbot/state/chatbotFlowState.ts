import { UpdateChatbotFlow } from '@/chatbot/types/chatbotFlow.type';
import { createState } from 'twenty-ui/utilities';

export const chatbotFlowState = createState<UpdateChatbotFlow | null>({
  key: 'chatbotFlowState',
  defaultValue: null,
});
