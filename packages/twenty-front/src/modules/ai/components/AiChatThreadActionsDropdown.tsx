import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { type ReactElement, type MouseEvent, useContext } from 'react';
import {
  ContextStorePageType,
  CoreObjectNameSingular,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { IconDotsVertical, IconPencil, IconUnlink } from 'twenty-ui/icon';

import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { agentChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';
import { getAiChatThreadActionsInstanceId } from '@/ai/utils/getAiChatThreadActionsInstanceId';
import { getAiChatThreadItemMenuDropdownId } from '@/ai/utils/getAiChatThreadItemMenuDropdownId';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

type AiChatThreadActionsDropdownProps = {
  thread: { id: string; title?: string | null; deletedAt?: string | null };
  surface: AiChatThreadActionsSurface;
  onRenameRequested: () => void;
  onDetach?: () => void;
  trigger?: ReactElement;
};

const AiChatThreadCommandMenuItems = () => {
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

// A conversation row offers the chat's record commands, next to the actions
// that only make sense in a list
export const AiChatThreadActionsDropdown = ({
  thread,
  surface,
  onRenameRequested,
  onDetach,
  trigger,
}: AiChatThreadActionsDropdownProps) => {
  const { t } = useLingui();
  const store = useStore();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
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

  const canUpdate = permissions?.canUpdate === true;
  const isDeleted = isDefined(thread.deletedAt);

  const targetThreadInContextStore = () => {
    const instanceKey = { instanceId };

    store.set(
      contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily(
        instanceKey,
      ),
      chatObjectMetadataItem.id,
    );
    store.set(
      contextStoreCurrentPageTypeComponentState.atomFamily(instanceKey),
      ContextStorePageType.Record,
    );
    store.set(
      contextStoreTargetedRecordsRuleComponentState.atomFamily(instanceKey),
      { mode: 'selection', selectedRecordIds: [thread.id] },
    );
    store.set(
      contextStoreNumberOfSelectedRecordsComponentState.atomFamily(instanceKey),
      1,
    );
    upsertRecordsInStore({
      partialRecords: [
        {
          __typename: 'AgentChatThread',
          id: thread.id,
          title: thread.title ?? null,
          deletedAt: thread.deletedAt ?? null,
        },
      ],
    });
  };

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
              targetThreadInContextStore();
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
