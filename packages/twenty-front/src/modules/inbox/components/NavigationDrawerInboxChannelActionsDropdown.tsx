import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconDotsVertical,
  IconEdit,
  IconColorSwatch,
  IconHeart,
  IconHeartOff,
  IconTrash,
} from 'twenty-ui/icon';

import { NavigationDrawerInboxChannelRolesSubmenu } from '@/inbox/components/NavigationDrawerInboxChannelRolesSubmenu';
import { useAddInboxChannelToFavorites } from '@/inbox/hooks/useAddInboxChannelToFavorites';
import { useIsInboxChannelFavorite } from '@/inbox/hooks/useIsInboxChannelFavorite';
import { useRemoveInboxChannelFromFavorites } from '@/inbox/hooks/useRemoveInboxChannelFromFavorites';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { type InboxChannel } from '@/inbox/types/InboxChannel';
import { type UpdateAgentChatChannelInput } from '~/generated-metadata/graphql';

type NavigationDrawerInboxChannelActionsDropdownProps = {
  channel: InboxChannel;
  destinationChannels: InboxChannel[];
  dropdownId: string;
  canManage: boolean;
  onRename: () => void;
  onChangeAppearance: () => void;
  onUpdate: (input: UpdateAgentChatChannelInput) => void;
  onDelete: (destinationChannelId: string | null) => void;
};

export const NavigationDrawerInboxChannelActionsDropdown = ({
  channel,
  destinationChannels,
  dropdownId,
  canManage,
  onRename,
  onChangeAppearance,
  onUpdate,
  onDelete,
}: NavigationDrawerInboxChannelActionsDropdownProps) => {
  const { t } = useLingui();
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();
  const isInboxChannelFavorite = useIsInboxChannelFavorite(channel.id);
  const { addInboxChannelToFavorites } = useAddInboxChannelToFavorites();
  const { removeInboxChannelFromFavorites } =
    useRemoveInboxChannelFromFavorites();

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
          {channel.isAccessible &&
            (isInboxChannelFavorite ? (
              <Dropdown.ActionItem
                startIcon={<IconHeartOff />}
                onClick={() => removeInboxChannelFromFavorites(channel.id)}
              >
                {t`Remove from favorites`}
              </Dropdown.ActionItem>
            ) : (
              <Dropdown.ActionItem
                startIcon={<IconHeart />}
                onClick={() => addInboxChannelToFavorites(channel.id)}
              >
                {t`Add to favorites`}
              </Dropdown.ActionItem>
            ))}
          {canManage && (
            <>
              <Dropdown.ActionItem startIcon={<IconEdit />} onClick={onRename}>
                {t`Rename`}
              </Dropdown.ActionItem>
              <Dropdown.ActionItem
                startIcon={<IconColorSwatch />}
                onClick={onChangeAppearance}
              >
                {t`Icon and color`}
              </Dropdown.ActionItem>
              <NavigationDrawerInboxChannelRolesSubmenu
                roleIds={channel.roleIds}
                onChange={(roleIds) => onUpdate({ roleIds })}
              />
              {getIsMetadataItemCustom(channel) &&
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
            </>
          )}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
