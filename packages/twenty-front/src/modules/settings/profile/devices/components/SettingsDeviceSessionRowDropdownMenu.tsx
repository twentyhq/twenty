import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { IconDotsVertical, IconLogout } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { RevokeUserSessionDocument } from '~/generated-metadata/graphql';

type SettingsDeviceSessionRowDropdownMenuProps = {
  userSessionId: string;
  onRevoked: () => void;
};

export const SettingsDeviceSessionRowDropdownMenu = ({
  userSessionId,
  onRevoked,
}: SettingsDeviceSessionRowDropdownMenuProps) => {
  const dropdownId = `settings-device-session-row-${userSessionId}`;

  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { closeDropdown } = useCloseDropdown();

  const [revokeUserSession] = useMutation(RevokeUserSessionDocument);

  const handleRevokeSession = async () => {
    closeDropdown(dropdownId);

    try {
      await revokeUserSession({ variables: { userSessionId } });
      enqueueSuccessSnackBar({ message: t`Device logged out` });
      onRevoked();
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to log out this device` });
    }
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <MenuItem
              accent="danger"
              LeftIcon={IconLogout}
              text={t`Log out`}
              onClick={handleRevokeSession}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
