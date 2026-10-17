import { useContext } from 'react';

import { AI_CHAT_INBOX_TAB_SELECTION_ENGINE_COMPONENT_KEYS } from '@/ai/constants/AiChatInboxTabSelectionEngineComponentKeys';
import { agentChatInboxTabSelectionState } from '@/ai/states/agentChatInboxTabSelectionState';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

export const AiChatThreadCommandMenuItems = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);
  const agentChatInboxTabSelection = useAtomStateValue(
    agentChatInboxTabSelectionState,
  );

  // A row is not the chat page, so it does not start a new chat. A selection
  // of every chat in a tab only offers what the server applies to all of them
  return commandMenuItems
    .filter(
      (item) =>
        item.availabilityType ===
          CommandMenuItemAvailabilityType.RECORD_SELECTION &&
        item.engineComponentKey !== EngineComponentKey.NEW_AI_CHAT &&
        (agentChatInboxTabSelection === null ||
          AI_CHAT_INBOX_TAB_SELECTION_ENGINE_COMPONENT_KEYS.has(
            item.engineComponentKey,
          )),
    )
    .map((item) => <CommandMenuItemRenderer item={item} key={item.id} />);
};
