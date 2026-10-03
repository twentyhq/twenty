import { type ReactNode } from 'react';

import { AiChatInboxSelectionToContextStoreEffect } from '@/ai/components/AiChatInboxSelectionToContextStoreEffect';
import { AiChatThreadCommandMenuItems } from '@/ai/components/AiChatThreadCommandMenuItems';
import { AI_CHAT_INBOX_INSTANCE_ID } from '@/ai/constants/AiChatInboxInstanceId';
import { CommandMenuDropdownAtCursor } from '@/command-menu-item/components/CommandMenuDropdownAtCursor';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';

type AiChatInboxCommandMenuScopeProps = {
  children: ReactNode;
};

// Commands on selected chats run against the inbox's own context store, not
// the page's main one
export const AiChatInboxCommandMenuScope = ({
  children,
}: AiChatInboxCommandMenuScopeProps) => (
  <ContextStoreComponentInstanceContext.Provider
    value={{ instanceId: AI_CHAT_INBOX_INSTANCE_ID }}
  >
    <CommandMenuComponentInstanceContext.Provider
      value={{ instanceId: AI_CHAT_INBOX_INSTANCE_ID }}
    >
      <AiChatInboxSelectionToContextStoreEffect />
      <CommandMenuContextProvider
        displayType="dropdownItem"
        containerType={CommandMenuItemContainerType.IndexPageDropdown}
      >
        <CommandMenuDropdownAtCursor>
          <AiChatThreadCommandMenuItems />
        </CommandMenuDropdownAtCursor>
      </CommandMenuContextProvider>
      {children}
    </CommandMenuComponentInstanceContext.Provider>
  </ContextStoreComponentInstanceContext.Provider>
);
