import {
  NODE_ACTIONS,
  OTHER_NODE_ACTIONS,
} from '@/chatbot/constants/NodeActions';
import { isValidChatbotNodeType } from '@/chatbot/utils/isValidChatbotNodeType';

export const getChatbotNodeIcon = (type: string): string | undefined => {
  const allActions = [...NODE_ACTIONS, ...OTHER_NODE_ACTIONS];

  if (!isValidChatbotNodeType(type)) return;

  const action = allActions.find((action) => action.type === type);

  return action?.icon;
};
