import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { H1Title } from 'twenty-ui/display';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const CommandMenuChatbotFlowEditStep = () => {
  // Create a key for the node component to be opened
  const chatbotFlowSelectedNode = useRecoilValue(chatbotFlowSelectedNodeState);

  console.log('chatbotFlowSelectedNode', chatbotFlowSelectedNode);

  return (
    <StyledContainer>
      <H1Title title={chatbotFlowSelectedNode?.data.title} />
    </StyledContainer>
  );
};
