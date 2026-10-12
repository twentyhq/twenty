import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconDotsVertical,
  IconEdit,
  IconColorSwatch,
  IconLock,
  IconTrash,
  IconWorld,
} from 'twenty-ui/icon';

import { NavigationDrawerAiChatChannelRolesSubmenu } from '@/ai/components/NavigationDrawerAiChatChannelRolesSubmenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import {
  type AgentChatChannel,
  type UpdateAgentChatChannelInput,
} from '~/generated-metadata/graphql';

type NavigationDrawerAiChatChannelActionsDropdownProps = {
  channel: AgentChatChannel;
  destinationChannels: AgentChatChannel[];
  dropdownId: string;
  onRename: () => void;
  onChangeAppearance: () => void;
  onUpdate: (input: UpdateAgentChatChannelInput) => void;
  onDelete: (destinationChannelId: string | null) => void;
};

export const NavigationDrawerAiChatChannelActionsDropdown = ({
  channel,
  destinationChannels,
  dropdownId,
  onRename,
  onChangeAppearance,
  onUpdate,
  onDelete,
}: NavigationDrawerAiChatChannelActionsDropdownProps) => {
  const { t } = useLingui();

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
          <Dropdown.ActionItem startIcon={<IconEdit />} onClick={onRename}>
            {t`Rename`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            startIcon={<IconColorSwatch />}
            onClick={onChangeAppearance}
          >
            {t`Icon and color`}
          </Dropdown.ActionItem>
          <Dropdown.Submenu>
            <Dropdown.SubmenuTrigger
              startIcon={
                channel.isOpenToEveryone ? <IconWorld /> : <IconLock />
              }
            >
              {t`Access`}
            </Dropdown.SubmenuTrigger>
            <Dropdown.Content aria-label={t`Who reads this channel`}>
              <Dropdown.Section label={t`Who reads this channel`}>
                <Dropdown.OptionItem
                  startIcon={<IconWorld />}
                  selected={channel.isOpenToEveryone}
                  onSelect={() => onUpdate({ isOpenToEveryone: true })}
                >
                  {t`Everyone`}
                </Dropdown.OptionItem>
                <Dropdown.OptionItem
                  startIcon={<IconLock />}
                  selected={!channel.isOpenToEveryone}
                  onSelect={() => onUpdate({ isOpenToEveryone: false })}
                >
                  {t`Selected roles`}
                </Dropdown.OptionItem>
              </Dropdown.Section>
            </Dropdown.Content>
          </Dropdown.Submenu>
          {!channel.isOpenToEveryone && (
            <NavigationDrawerAiChatChannelRolesSubmenu
              roleIds={channel.roleIds}
              onChange={(roleIds) => onUpdate({ roleIds })}
            />
          )}
          {channel.isCustom &&
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
