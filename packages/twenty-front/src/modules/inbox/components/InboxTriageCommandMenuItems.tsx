import { type ReactNode, useContext } from 'react';

import { INBOX_TRIAGE_ENGINE_COMPONENT_KEYS } from '@/inbox/constants/InboxTriageEngineComponentKeys';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';

type InboxTriageCommandMenuItemsProps = {
  children: ReactNode;
};

// The list header only has room for triage; every other command stays in the
// command menu
export const InboxTriageCommandMenuItems = ({
  children,
}: InboxTriageCommandMenuItemsProps) => {
  const commandMenuContext = useContext(CommandMenuContext);

  return (
    <CommandMenuContext.Provider
      value={{
        ...commandMenuContext,
        commandMenuItems: commandMenuContext.commandMenuItems.filter(
          ({ engineComponentKey }) =>
            INBOX_TRIAGE_ENGINE_COMPONENT_KEYS.has(engineComponentKey),
        ),
      }}
    >
      {children}
    </CommandMenuContext.Provider>
  );
};
