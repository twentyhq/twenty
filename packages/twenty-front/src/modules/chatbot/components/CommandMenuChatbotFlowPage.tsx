import {
  ChatbotAction,
  NODE_ACTIONS,
  OTHER_NODE_ACTIONS,
} from '@/chatbot/constants/NodeActions';
import { chatbotFlowState } from '@/chatbot/state/chatbotFlowState';
import { ChatbotFlow } from '@/chatbot/types/chatbotFlow.type';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui/display';
import { MenuItemCommand } from 'twenty-ui/navigation';
import { v4 } from 'uuid';

export const CommandMenuChatbotFlowPage = () => {
  const { getIcon } = useIcons();

  const chatbotFlow = useRecoilValue(chatbotFlowState);
  console.log('chatbotFlow', chatbotFlow);

  const handleAddNode = (action: ChatbotAction) => {
    // Change this code to add new node to the chatbot flow
    // and update the chatbot flow state with the new node

    if (!chatbotFlow) {
      return;
    }

    const newNode = {
      ...action,
      id: v4(),
      type: action.type,
      position: { x: 0, y: 0 },
      data: {},
    };

    const updatedChatbotFlow: ChatbotFlow = {
      ...chatbotFlow,
      nodes: [...chatbotFlow.nodes, newNode],
    };

    console.log('Updated Chatbot Flow:', updatedChatbotFlow);
  };

  return (
    <RightDrawerStepListContainer>
      <RightDrawerWorkflowSelectStepTitle>
        Node Type
      </RightDrawerWorkflowSelectStepTitle>
      {NODE_ACTIONS.map((action) => (
        <MenuItemCommand
          key={action.type}
          LeftIcon={getIcon(action.icon)}
          text={action.label}
          onClick={() => handleAddNode(action)}
        />
      ))}
      <RightDrawerWorkflowSelectStepTitle>
        Conditions
      </RightDrawerWorkflowSelectStepTitle>
      {OTHER_NODE_ACTIONS.map((action) => (
        <MenuItemCommand
          key={action.type}
          LeftIcon={getIcon(action.icon)}
          text={action.label}
          onClick={() => handleAddNode(action)}
        />
      ))}
    </RightDrawerStepListContainer>
  );
};
