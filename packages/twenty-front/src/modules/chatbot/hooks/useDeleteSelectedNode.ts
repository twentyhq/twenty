import { useRecoilState, useSetRecoilState } from 'recoil';
import { chatbotFlowState } from '@/chatbot/state/chatbotFlowState';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { useUpdateChatbotFlow } from './useUpdateChatbotFlow';

export const useDeleteSelectedNode = () => {
  const [chatbotFlow, setChatbotFlow] = useRecoilState(chatbotFlowState);
  const setSelectedNode = useSetRecoilState(chatbotFlowSelectedNodeState);
  const { updateFlow } = useUpdateChatbotFlow();

  const deleteSelectedNode = (nodeId: string) => {
    if (!chatbotFlow || !nodeId) return;

    const updatedNodes = chatbotFlow.nodes?.filter(
      (node) => node.id !== nodeId,
    );
    const updatedEdges = chatbotFlow.edges?.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId,
    );

    // @ts-expect-error remover campos que não são aceitos na mutation
    const { id, __typename, workspace, ...chatbotFlowWithoutId } = chatbotFlow;

    const updatedChatbotFlow = {
      ...chatbotFlowWithoutId,
      nodes: updatedNodes,
      edges: updatedEdges,
      viewport: { x: 0, y: 0, zoom: 0 },
    };

    setSelectedNode(undefined);
    updateFlow(updatedChatbotFlow);
  };

  return { deleteSelectedNode };
};
