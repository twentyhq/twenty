import { ChatbotFlowInput } from 'src/engine/core-modules/chatbot-flow/dtos/chatbot-flow.input';

export const sanitizeFlow = (flow: ChatbotFlowInput) => {
  return {
    ...flow,
    nodes: flow.nodes.map((item) => ({
      id: item.id,
      data: item.data,
      type: item.type,
      position: item.position,
      selected: item.selected,
    })),
  };
};
