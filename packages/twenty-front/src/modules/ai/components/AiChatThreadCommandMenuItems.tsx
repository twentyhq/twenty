import { useContext } from 'react';
import { AGENT_CHAT_INBOX_TAB_ACTIONS } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_INBOX_ACTION_BY_ENGINE_COMPONENT_KEY } from '@/ai/constants/AiChatInboxActionByEngineComponentKey';
import { agentChatInboxTabSelectionState } from '@/ai/states/agentChatInboxTabSelectionState';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

const isInboxTabAction = (engineComponentKey: EngineComponentKey) => {
  const action =
    AI_CHAT_INBOX_ACTION_BY_ENGINE_COMPONENT_KEY[engineComponentKey];

  return isDefined(action) && AGENT_CHAT_INBOX_TAB_ACTIONS.has(action);
};

export const AiChatThreadCommandMenuItems = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);
  const agentChatInboxTabSelection = useAtomStateValue(
    agentChatInboxTabSelectionState,
  );

  // A row is not the chat page, so it does not start a new chat
  return commandMenuItems
    .filter(
      (item) =>
        item.availabilityType ===
          CommandMenuItemAvailabilityType.RECORD_SELECTION &&
        item.engineComponentKey !== EngineComponentKey.NEW_AI_CHAT &&
        (!isDefined(agentChatInboxTabSelection) ||
          isInboxTabAction(item.engineComponentKey)),
    )
    .map((item) => <CommandMenuItemRenderer item={item} key={item.id} />);
};
