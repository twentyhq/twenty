export type ChatbotFlowInput = {
  nodes: any[]; // create typing when defining flow
  edges: any[]; // create typing when defining flow
  chatbotId: string;
  workspaceId: string;
};

export type UpdateChatbotFlow = Omit<ChatbotFlowInput, 'workspaceId'>;
