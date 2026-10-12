import { useLingui } from '@lingui/react/macro';
import { type MouseEvent } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconPencil, IconUnlink } from 'twenty-ui/icon';

import { AiChatThreadCommandMenuItems } from '@/ai/components/AiChatThreadCommandMenuItems';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { useTargetAiChatThreadsInContextStore } from '@/ai/hooks/useTargetAiChatThreadsInContextStore';
import { agentChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
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

type AiChatThreadActionsDropdownProps = {
  thread: {
    id: string;
    title?: string | null;
    deletedAt?: string | null;
    lastActivityAt?: string | null;
  };
  instanceId: string;
  onRenameRequested: () => void;
  onDetach?: () => void;
};

export const AiChatThreadActionsDropdown = ({
  thread,
  instanceId,
  onRenameRequested,
  onDetach,
}: AiChatThreadActionsDropdownProps) => {
  const { t } = useLingui();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { targetAiChatThreadsInContextStore } =
    useTargetAiChatThreadsInContextStore();
  const { refreshAgentChatThreadPermissions } =
    useRefreshAgentChatThreadPermissions();
  const chatObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: CoreObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    },
  );
  const permissions = useAtomFamilySelectorValue(
    agentChatThreadPermissionsFamilySelector,
    thread.id,
  );
  if (!isDefined(chatObjectMetadataItem)) {
    return null;
  }

  const canUpdate = isDefined(permissions) && permissions.canUpdate;
  const isDeleted = isDefined(thread.deletedAt);

  const handleRename = (event: MouseEvent) => {
    event.stopPropagation();
    onRenameRequested();
  };

  const handleDetach = (event: MouseEvent) => {
    event.stopPropagation();
    onDetach?.();
  };

  return (
    <ContextStoreComponentInstanceContext.Provider value={{ instanceId }}>
      <CommandMenuComponentInstanceContext.Provider value={{ instanceId }}>
        <DropdownRoot
          dropdownId={getCommandMenuDropdownIdFromCommandMenuId(instanceId)}
          type="menu"
          onOpenChange={(isOpen) => {
            if (isOpen) {
              targetAiChatThreadsInContextStore({
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
              void refreshAgentChatThreadPermissions([thread.id]);
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
              {canUpdate && !isDeleted && (
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
                <AiChatThreadCommandMenuItems />
              </CommandMenuContextProvider>
            </Dropdown.Section>
          </DropdownContent>
        </DropdownRoot>
      </CommandMenuComponentInstanceContext.Provider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};
