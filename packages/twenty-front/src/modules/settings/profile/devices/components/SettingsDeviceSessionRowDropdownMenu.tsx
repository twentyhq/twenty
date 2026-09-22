import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';

import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useToast } from 'twenty-ui/primitives/feedback';
import { IconDotsVertical, IconLogout } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import {
  CurrentUserSessionsDocument,
  RevokeUserSessionDocument,
} from '~/generated-metadata/graphql';
import { Menu } from 'twenty-ui/primitives/surfaces';

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
    <DropdownMenu
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      clickableComponent={
        <LightIconButton emphasis="subtle" aria-label={t`More options`}>
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent>
          <Menu.Group>
            <Menu.Item
              color="danger"
              startIcon={<IconLogout />}
              onClick={handleRevokeSession}
            >{t`Log out`}</Menu.Item>
          </Menu.Group>
        </DropdownContent>
      }
    />
  );
};
