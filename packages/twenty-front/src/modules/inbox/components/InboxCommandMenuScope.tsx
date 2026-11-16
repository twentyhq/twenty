import { type ReactNode } from 'react';

import { InboxSelectionToContextStoreEffect } from '@/inbox/components/InboxSelectionToContextStoreEffect';
import { AiChatThreadCommandMenuItems } from '@/ai/components/AiChatThreadCommandMenuItems';
import { INBOX_INSTANCE_ID } from '@/inbox/constants/InboxInstanceId';
import { CommandMenuDropdownAtCursor } from '@/command-menu-item/components/CommandMenuDropdownAtCursor';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';

type InboxCommandMenuScopeProps = {
  children: ReactNode;
};

export const InboxCommandMenuScope = ({
  children,
}: InboxCommandMenuScopeProps) => (
  <ContextStoreComponentInstanceContext.Provider
    value={{ instanceId: INBOX_INSTANCE_ID }}
  >
    <CommandMenuComponentInstanceContext.Provider
      value={{ instanceId: INBOX_INSTANCE_ID }}
    >
      <InboxSelectionToContextStoreEffect
        contextStoreInstanceId={INBOX_INSTANCE_ID}
      />
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
