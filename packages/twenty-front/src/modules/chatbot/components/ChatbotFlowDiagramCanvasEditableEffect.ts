import { useCallback, useContext } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';

import { useChatbotFlowCommandMenu } from '@/chatbot/hooks/useChatbotFlowCommandMenu';
import { chatbotFlowIdState } from '@/chatbot/state/chatbotFlowIdState';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { getChatbotNodeIcon } from '@/chatbot/utils/getChatbotNodeIcon';
import { getChatbotNodeLabel } from '@/chatbot/utils/getChatbotNodeLabel';
import { isValidChatbotNodeType } from '@/chatbot/utils/isValidChatbotNodeType';
import {
  Node,
  OnSelectionChangeParams,
  useOnSelectionChange,
} from '@xyflow/react';
import { useIcons } from 'twenty-ui/display';

export const ChatbotFlowDiagramCanvasEditableEffect = () => {
  const { getIcon } = useIcons();
  const { openChatbotFlowCommandMenu, openChatbotFlowStepEditCommandMenu } =
    useChatbotFlowCommandMenu();

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const setChatbotFlowSelectedNode = useSetRecoilState(
    chatbotFlowSelectedNodeState,
  );

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const chatbotFlowId = useRecoilValue(chatbotFlowIdState);

  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      if (!isInRightDrawer) {
        setCommandMenuNavigationStack([]);
      }

      if (!chatbotFlowId) return;

      const selectedNode = nodes[0] as Node | undefined;
      const nodeType = selectedNode?.type;

      if (
        // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
        selectedNode &&
        typeof nodeType === 'string' &&
        isValidChatbotNodeType(nodeType)
      ) {
        setChatbotFlowSelectedNode(selectedNode);

        openChatbotFlowStepEditCommandMenu(
          chatbotFlowId,
          getChatbotNodeLabel(nodeType) ?? '',
          getIcon(getChatbotNodeIcon(nodeType)),
        );
        return;
      } else {
        openChatbotFlowCommandMenu(chatbotFlowId);
        return;
      }
    },
    [
      isInRightDrawer,
      chatbotFlowId,
      setCommandMenuNavigationStack,
      setChatbotFlowSelectedNode,
      openChatbotFlowStepEditCommandMenu,
      getIcon,
      openChatbotFlowCommandMenu,
    ],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  return null;
};
