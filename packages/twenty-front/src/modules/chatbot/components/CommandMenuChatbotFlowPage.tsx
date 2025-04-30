import {
  NODE_ACTIONS,
  OTHER_NODE_ACTIONS,
} from '@/chatbot/constants/NodeActions';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';
import { useIcons } from 'twenty-ui/display';
import { MenuItemCommand } from 'twenty-ui/navigation';

export const CommandMenuChatbotFlowPage = () => {
  const { getIcon } = useIcons();

  // TO DO
  console.log(
    'Feature to implement after creating the bots nodes and main functionality',
  );

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
          onClick={() => console.log('action', action)}
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
          onClick={() => console.log('other action', action)}
        />
      ))}
    </RightDrawerStepListContainer>
  );
};
