import { useCallback, useContext } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';

import { useChatbotFlowCommandMenu } from '@/chatbot/hooks/useChatbotFlowCommandMenu';
import { chatbotFlowIdState } from '@/chatbot/state/chatbotFlowIdState';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';

export const ChatbotFlowDiagramCanvasEditableEffect = () => {
  const { openChatbotFlowCommandMenu } = useChatbotFlowCommandMenu();

  // const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const chatbotFlowId = useRecoilValue(chatbotFlowIdState);

  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      // const selectedNode = nodes[0] as Node;

      if (!isInRightDrawer) {
        setCommandMenuNavigationStack([]);
      }

      // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
      if (chatbotFlowId) {
        openChatbotFlowCommandMenu(chatbotFlowId);
      }

      // if (!isDefined(selectedNode)) {
      //   return;
      // }

      // setWorkflowSelectedNode(selectedNode.id);
    },
    [
      isInRightDrawer,
      setCommandMenuNavigationStack,
      chatbotFlowId,
      openChatbotFlowCommandMenu,
      // setWorkflowSelectedNode
    ],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  return null;
};
