import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { LightIconButton, useToast } from 'twenty-ui/components';
import { IconDotsVertical, IconLogout } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import {
  CurrentUserSessionsDocument,
  RevokeUserSessionDocument,
} from '~/generated-metadata/graphql';

type SettingsDeviceSessionRowDropdownMenuProps = {
  userSessionId: string;
};

export const SettingsDeviceSessionRowDropdownMenu = ({
  userSessionId,
}: SettingsDeviceSessionRowDropdownMenuProps) => {
  const dropdownId = `settings-device-session-row-${userSessionId}`;

  const { enqueueToast } = useToast();
  const { closeDropdown } = useCloseDropdown();

  const [revokeUserSession] = useMutation(RevokeUserSessionDocument, {
    refetchQueries: [CurrentUserSessionsDocument],
  });

  const handleRevokeSession = async () => {
    closeDropdown(dropdownId);

    try {
      await revokeUserSession({ variables: { userSessionId } });
      enqueueToast({ variant: 'success', children: t`Device logged out` });
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Failed to log out this device`,
      });
    }
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      clickableComponent={
        <LightIconButton emphasis="subtle" aria-label={t`More options`}>
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <ListItem
              color="danger"
              startIcon={<IconLogout />}
              onClick={handleRevokeSession}
            >{t`Log out`}</ListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
