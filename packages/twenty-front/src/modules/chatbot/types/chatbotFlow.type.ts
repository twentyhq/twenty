import { Edge, Node } from '@xyflow/react';

export type ChatbotFlow = {
  nodes: Node[];
  edges: Edge[];
  chatbotId: string;
  viewport?: { x: number; y: number; zoom: number };
};

export type ChatbotFlowInput = Omit<ChatbotFlow, 'viewport'>;

export type UpdateChatbotFlow = ChatbotFlow;
