import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent } from 'react';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconColorSwatch,
  IconDotsVertical,
  IconPencil,
  IconUnlink,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { parseThemeColor } from 'twenty-ui/utilities';

import { InboxThreadRowTriage } from '@/inbox/components/InboxThreadRowTriage';
import { AiChatThreadCommandMenuItems } from '@/ai-chat/threads/components/AiChatThreadCommandMenuItems';
import { useAiChatThreadImage } from '@/ai-chat/threads/hooks/useAiChatThreadImage';
import { useRefreshAiChatThreadPermissions } from '@/ai-chat/threads/hooks/useRefreshAiChatThreadPermissions';
import { useTargetAiChatThreadsInContextStore } from '@/ai-chat/threads/hooks/useTargetAiChatThreadsInContextStore';
import { aiChatThreadPermissionsFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadPermissionsFamilySelector';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';

const StyledIconPicker = styled(IconPicker)`
  position: absolute;
  right: 0;
`;

const StyledIconPickerAnchor = styled.span`
  display: block;
  height: ${themeCssVariables.spacing[6]};
  width: 0;
`;

type InboxThreadActionsDropdownProps = {
  thread: {
    id: string;
    title?: string | null;
    icon?: string | null;
    iconColor?: string | null;
    imageFile?: AiChatThreadRecord['imageFile'];
    conversationType?: AiChatThreadRecord['conversationType'];
    deletedAt?: string | null;
    lastActivityAt?: string | null;
  };
  instanceId: string;
  iconPickerDropdownId?: string;
  onIconPickerOpenChange?: (isOpen: boolean) => void;
  onRenameRequested?: () => void;
  onDetach?: () => void;
  shouldShowTriageActions?: boolean;
  shouldShowMore?: boolean;
};

export const InboxThreadActionsDropdown = ({
  thread,
  instanceId,
  iconPickerDropdownId,
  onIconPickerOpenChange,
  onRenameRequested,
  onDetach,
  shouldShowTriageActions = false,
  shouldShowMore = true,
}: InboxThreadActionsDropdownProps) => {
  const { t } = useLingui();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { targetAiChatThreadsInContextStore } =
    useTargetAiChatThreadsInContextStore();
  const { refreshAiChatThreadPermissions } =
    useRefreshAiChatThreadPermissions();
  const chatObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: StandardObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    },
  );
  const permissions = useAtomFamilySelectorValue(
    aiChatThreadPermissionsFamilySelector,
    thread.id,
  );
  const { canCustomizeImage, setIcon, setIconColor, uploadImage, removeImage } =
    useAiChatThreadImage(thread);
  const { openDropdown } = useOpenDropdown();

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

  const canChangeImage =
    isDefined(iconPickerDropdownId) &&
    canCustomizeImage &&
    canUpdate &&
    !isDeleted &&
    thread.conversationType !== AgentChatThreadConversationType.DIRECT_MESSAGE;

  const handleChangeIcon = (event: MouseEvent) => {
    event.stopPropagation();
    openDropdown({
      dropdownComponentInstanceIdFromProps: iconPickerDropdownId,
    });
  };

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
                void refreshAiChatThreadPermissions([thread.id]);
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
                {canChangeImage && (
                  <Dropdown.ActionItem
                    startIcon={<IconColorSwatch />}
                    onClick={handleChangeIcon}
                  >
                    {t`Change image`}
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
        )}
        {canChangeImage && (
          <StyledIconPicker
            dropdownId={iconPickerDropdownId}
            selectedIconKey={thread.icon ?? undefined}
            onOpen={() => onIconPickerOpenChange?.(true)}
            onClose={() => onIconPickerOpenChange?.(false)}
            onChange={({ iconKey }) => void setIcon(iconKey)}
            iconColorPicker={{
              selectedColor: parseThemeColor(thread.iconColor),
              onColorChange: (color) => void setIconColor(color),
            }}
            clickableComponent={<StyledIconPickerAnchor aria-hidden />}
            imageUpload={{
              imageUrl: thread.imageFile?.[0]?.url,
              onUpload: (file) => void uploadImage(file),
              onRemove: () => void removeImage(),
            }}
          />
        )}
      </CommandMenuComponentInstanceContext.Provider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};
