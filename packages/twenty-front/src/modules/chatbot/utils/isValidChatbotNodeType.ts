import {
  NODE_ACTIONS,
  OTHER_NODE_ACTIONS,
} from '@/chatbot/constants/NodeActions';

const allowedNodeTypes = [
  ...NODE_ACTIONS.map((a) => a.type),
  ...OTHER_NODE_ACTIONS.map((a) => a.type),
] as const;

export type AllowedNodeType = (typeof allowedNodeTypes)[number];

export const isValidChatbotNodeType = (
  type: string,
): type is AllowedNodeType => {
  return allowedNodeTypes.includes(type as AllowedNodeType);
};
