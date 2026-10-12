import { useContext } from 'react';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

export const AiChatThreadCommandMenuItems = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  // A row is not the chat page, so it does not start a new chat
  return commandMenuItems
    .filter(
      (item) =>
        item.availabilityType ===
          CommandMenuItemAvailabilityType.RECORD_SELECTION &&
        item.engineComponentKey !== EngineComponentKey.NEW_AI_CHAT,
    )
    .map((item) => <CommandMenuItemRenderer item={item} key={item.id} />);
};
