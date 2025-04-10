export type ChatbotFlow = {
  nodes: any[]; // create typing when defining flow
  edges: any[]; // create typing when defining flow
  chatbotId: string;
  workspaceId: string;
  viewport: { [key: string]: any }; // create typing when defining flow
};

export type ChatbotFlowInput = Omit<ChatbotFlow, 'workspaceId' | 'viewport'>;

export type UpdateChatbotFlow = Omit<ChatbotFlow, 'workspaceId'>;
