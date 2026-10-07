import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconDotsVertical,
  IconEdit,
  IconLock,
  IconLogout,
  IconTrash,
  IconWorld,
} from 'twenty-ui/icon';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import {
  type AgentChatChannelListItem,
  AgentChatChannelVisibility,
} from '~/generated-metadata/graphql';

type NavigationDrawerAiChatChannelActionsDropdownProps = {
  channel: AgentChatChannelListItem;
  destinationChannels: AgentChatChannelListItem[];
  dropdownId: string;
  onRename: () => void;
  onSetVisibility: (visibility: AgentChatChannelVisibility) => void;
  onLeave: () => void;
  onDelete: (destinationChannelId: string | null) => void;
};

export const NavigationDrawerAiChatChannelActionsDropdown = ({
  channel,
  destinationChannels,
  dropdownId,
  onRename,
  onSetVisibility,
  onLeave,
  onDelete,
}: NavigationDrawerAiChatChannelActionsDropdownProps) => {
  const { t } = useLingui();
  const isPublic = channel.visibility === AgentChatChannelVisibility.PUBLIC;

  return (
    <DropdownRoot type="menu" dropdownId={dropdownId}>
      <Dropdown.Trigger
        render={
          <LightIconButton emphasis="subtle" aria-label={t`Channel options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownContent side="right" align="start">
        <Dropdown.Section>
          {channel.canManage && (
            <>
              <Dropdown.ActionItem startIcon={<IconEdit />} onClick={onRename}>
                {t`Rename`}
              </Dropdown.ActionItem>
              <Dropdown.ActionItem
                startIcon={isPublic ? <IconLock /> : <IconWorld />}
                onClick={() =>
                  onSetVisibility(
                    isPublic
                      ? AgentChatChannelVisibility.PRIVATE
                      : AgentChatChannelVisibility.PUBLIC,
                  )
                }
              >
                {isPublic ? t`Make private` : t`Make public`}
              </Dropdown.ActionItem>
            </>
          )}
          <Dropdown.ActionItem startIcon={<IconLogout />} onClick={onLeave}>
            {t`Leave channel`}
          </Dropdown.ActionItem>
          {channel.canManage &&
            (destinationChannels.length === 0 ? (
              <Dropdown.ActionItem
                color="danger"
                startIcon={<IconTrash />}
                onClick={() => onDelete(null)}
              >
                {t`Delete channel`}
              </Dropdown.ActionItem>
            ) : (
              <Dropdown.Submenu>
                <Dropdown.SubmenuTrigger
                  color="danger"
                  startIcon={<IconTrash />}
                >
                  {t`Delete channel`}
                </Dropdown.SubmenuTrigger>
                <Dropdown.Content aria-label={t`Move its chats to`}>
                  <Dropdown.Section label={t`Move its chats to`}>
                    {destinationChannels.map((destinationChannel) => (
                      <Dropdown.ActionItem
                        key={destinationChannel.id}
                        onClick={() => onDelete(destinationChannel.id)}
                      >
                        {destinationChannel.name}
                      </Dropdown.ActionItem>
                    ))}
                  </Dropdown.Section>
                </Dropdown.Content>
              </Dropdown.Submenu>
            ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
