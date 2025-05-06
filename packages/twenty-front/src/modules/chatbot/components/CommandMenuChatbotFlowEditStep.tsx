import { ChatbotFlowTextEventForm } from '@/chatbot/components/actions/ChatbotFlowTextEventForm';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const CommandMenuChatbotFlowEditStep = () => {
  // Criar switch para qual componente de node deve abrir
  const chatbotFlowSelectedNode = useRecoilValue(chatbotFlowSelectedNodeState);

  let content = null;

  switch (chatbotFlowSelectedNode?.type) {
    case 'text': {
      content = (
        <ChatbotFlowTextEventForm selectedNode={chatbotFlowSelectedNode} />
      );

      break;
    }
    case 'condicional': {
      content = <p>Test</p>;
      break;
    }
  }

  return <StyledContainer>{content}</StyledContainer>;
};
