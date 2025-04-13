import { Edge, Node } from '@xyflow/react';

export type ChatbotFlow = {
  nodes: Node[];
  edges: Edge[];
  chatbotId: string;
  workspaceId: string;
  viewport: { x: number; y: number; zoom: number };
};

export type ChatbotFlowInput = Omit<ChatbotFlow, 'workspaceId' | 'viewport'>;

export type UpdateChatbotFlow = Omit<ChatbotFlow, 'workspaceId'>;
