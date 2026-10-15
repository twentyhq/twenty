import { type ReactNode, useContext } from 'react';

import { AI_CHAT_INBOX_TRIAGE_ENGINE_COMPONENT_KEYS } from '@/ai/constants/AiChatInboxTriageEngineComponentKeys';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';

type AiChatInboxTriageCommandMenuItemsProps = {
  children: ReactNode;
};

// The list header only has room for triage; every other command stays in the
// command menu
export const AiChatInboxTriageCommandMenuItems = ({
  children,
}: AiChatInboxTriageCommandMenuItemsProps) => {
  const commandMenuContext = useContext(CommandMenuContext);

  return (
    <CommandMenuContext.Provider
      value={{
        ...commandMenuContext,
        commandMenuItems: commandMenuContext.commandMenuItems.filter(
          ({ engineComponentKey }) =>
            AI_CHAT_INBOX_TRIAGE_ENGINE_COMPONENT_KEYS.has(engineComponentKey),
        ),
      }}
    >
      {children}
    </CommandMenuContext.Provider>
  );
};
