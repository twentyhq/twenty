import { useLingui } from '@lingui/react/macro';
import { type MouseEvent } from 'react';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconPencil, IconUnlink } from 'twenty-ui/icon';

import { InboxThreadRowTriage } from '@/ai/components/AiChatThreadRowTriage';
import { InboxThreadCommandMenuItems } from '@/ai/components/AiChatThreadCommandMenuItems';
import { useRefreshInboxThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { useTargetInboxThreadsInContextStore } from '@/ai/hooks/useTargetAiChatThreadsInContextStore';
import { inboxThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';

type InboxThreadActionsDropdownProps = {
  thread: {
    id: string;
    title?: string | null;
    conversationType?: InboxThreadRecord['conversationType'];
    deletedAt?: string | null;
    lastActivityAt?: string | null;
  };
  instanceId: string;
  onRenameRequested?: () => void;
  onDetach?: () => void;
  shouldShowTriageActions?: boolean;
  shouldShowMore?: boolean;
};

export const InboxThreadActionsDropdown = ({
  thread,
  instanceId,
  onRenameRequested,
  onDetach,
  shouldShowTriageActions = false,
  shouldShowMore = true,
}: InboxThreadActionsDropdownProps) => {
  const { t } = useLingui();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { targetInboxThreadsInContextStore } =
    useTargetInboxThreadsInContextStore();
  const { refreshInboxThreadPermissions } = useRefreshInboxThreadPermissions();
  const chatObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: StandardObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    },
  );
  const permissions = useAtomFamilySelectorValue(
    inboxThreadPermissionsFamilySelector,
    thread.id,
  );
  if (!isDefined(chatObjectMetadataItem)) {
    return null;
  }

  const canUpdate = isDefined(permissions) && permissions.canUpdate;
  const isDeleted = isDefined(thread.deletedAt);
  const canRename =
    isDefined(onRenameRequested) &&
    canUpdate &&
    !isDeleted &&
    thread.conversationType !== AgentChatThreadConversationType.DIRECT_MESSAGE;

  const handleRename = (event: MouseEvent) => {
    event.stopPropagation();
    onRenameRequested?.();
  };

  const handleDetach = (event: MouseEvent) => {
    event.stopPropagation();
    onDetach?.();
  };

  return (
    <ContextStoreComponentInstanceContext.Provider value={{ instanceId }}>
      <CommandMenuComponentInstanceContext.Provider value={{ instanceId }}>
        {shouldShowTriageActions && !isDeleted && (
          <InboxThreadRowTriage threadId={thread.id} />
        )}
        {shouldShowMore && (
          <DropdownRoot
            dropdownId={getCommandMenuDropdownIdFromCommandMenuId(instanceId)}
            type="menu"
            onOpenChange={(isOpen) => {
              if (isOpen) {
                targetInboxThreadsInContextStore({
                  contextStoreInstanceId: instanceId,
                  threadIds: [thread.id],
                });
                upsertRecordsInStore({
                  partialRecords: [
                    {
                      __typename: 'AgentChatThread',
                      id: thread.id,
                      title: thread.title ?? null,
                      deletedAt: thread.deletedAt ?? null,
                      ...(isDefined(thread.lastActivityAt)
                        ? { lastActivityAt: thread.lastActivityAt }
                        : {}),
                    },
                  ],
                });
                void refreshInboxThreadPermissions([thread.id]);
              }
            }}
          >
            <Dropdown.Trigger
              render={
                <LightIconButton aria-label={t`Chat actions`} emphasis="subtle">
                  <IconDotsVertical />
                </LightIconButton>
              }
            />
            <DropdownContent align="end" aria-label={t`Chat actions`}>
              <Dropdown.Section>
                {isDefined(onDetach) && canUpdate && (
                  <Dropdown.ActionItem
                    startIcon={<IconUnlink />}
                    onClick={handleDetach}
                  >
                    {t`Detach`}
                  </Dropdown.ActionItem>
                )}
                {canRename && (
                  <Dropdown.ActionItem
                    startIcon={<IconPencil />}
                    onClick={handleRename}
                  >
                    {t`Rename`}
                  </Dropdown.ActionItem>
                )}
                <CommandMenuContextProvider
                  displayType="dropdownItem"
                  containerType={CommandMenuItemContainerType.IndexPageDropdown}
                >
                  <InboxThreadCommandMenuItems />
                </CommandMenuContextProvider>
              </Dropdown.Section>
            </DropdownContent>
          </DropdownRoot>
        )}
      </CommandMenuComponentInstanceContext.Provider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};
