import { useLingui } from '@lingui/react/macro';
import { type ReactElement, type MouseEvent } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { IconDotsVertical, IconPencil, IconUnlink } from 'twenty-ui/icon';

import { AiChatThreadCommandMenuItems } from '@/ai/components/AiChatThreadCommandMenuItems';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { useTargetAiChatThreadsInContextStore } from '@/ai/hooks/useTargetAiChatThreadsInContextStore';
import { agentChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';
import { getAiChatThreadActionsInstanceId } from '@/ai/utils/getAiChatThreadActionsInstanceId';
import { getAiChatThreadItemMenuDropdownId } from '@/ai/utils/getAiChatThreadItemMenuDropdownId';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
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
  surface: AiChatThreadActionsSurface;
  onRenameRequested: () => void;
  onDetach?: () => void;
  trigger?: ReactElement;
};

export const AiChatThreadActionsDropdown = ({
  thread,
  surface,
  onRenameRequested,
  onDetach,
  trigger,
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
  const instanceId = getAiChatThreadActionsInstanceId({
    threadId: thread.id,
    surface,
  });

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
          dropdownId={getAiChatThreadItemMenuDropdownId({
            threadId: thread.id,
            surface,
          })}
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
              trigger ?? (
                <LightIconButton aria-label={t`Chat actions`} emphasis="subtle">
                  <IconDotsVertical />
                </LightIconButton>
              )
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
