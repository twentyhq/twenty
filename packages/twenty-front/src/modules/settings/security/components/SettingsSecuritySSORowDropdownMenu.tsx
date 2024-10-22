/* @license Enterprise */

import { IconArchive, IconDotsVertical, IconTrash } from 'twenty-ui';

import { useDeleteSSOIdentityProvider } from '@/settings/security/hooks/useDeleteSSOIdentityProvider';
import { useUpdateSSOIdentityProvider } from '@/settings/security/hooks/useUpdateSSOIdentityProvider';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProviders.state';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { UnwrapRecoilValue } from 'recoil';
import { SsoIdentityProviderStatus } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

type SettingsSecuritySSORowDropdownMenuProps = {
  SSOIdp: UnwrapRecoilValue<typeof SSOIdentitiesProvidersState>[0];
};

export const SettingsSecuritySSORowDropdownMenu = ({
  SSOIdp,
}: SettingsSecuritySSORowDropdownMenuProps) => {
  const dropdownId = `settings-account-row-${SSOIdp.id}`;

  const { enqueueSnackBar } = useSnackBar();

  const { closeDropdown } = useDropdown(dropdownId);

  const { deleteSSOIdentityProvider } = useDeleteSSOIdentityProvider();
  const { updateSSOIdentityProvider } = useUpdateSSOIdentityProvider();

  const handleDeleteSSOIdentityProvider = async (
    identityProviderId: string,
  ) => {
    const result = await deleteSSOIdentityProvider({
      identityProviderId,
    });
    if (isDefined(result.errors)) {
      enqueueSnackBar('Error deleting SSO Identity Provider', {
        variant: SnackBarVariant.Error,
        duration: 2000,
      });
    }
  };

  const toggleSSOIdentityProviderStatus = async (
    identityProviderId: string,
  ) => {
    const result = await updateSSOIdentityProvider({
      id: identityProviderId,
      status:
        SSOIdp.status === 'Active'
          ? SsoIdentityProviderStatus.Inactive
          : SsoIdentityProviderStatus.Active,
    });
    if (isDefined(result.errors)) {
      enqueueSnackBar('Error editing SSO Identity Provider', {
        variant: SnackBarVariant.Error,
        duration: 2000,
      });
    }
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      dropdownHotkeyScope={{ scope: dropdownId }}
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownComponents={
        <DropdownMenu>
          <DropdownMenuItemsContainer>
            <MenuItem
              accent="default"
              LeftIcon={IconArchive}
              text={SSOIdp.status === 'Active' ? 'Deactivate' : 'Activate'}
              onClick={() => {
                toggleSSOIdentityProviderStatus(SSOIdp.id);
                closeDropdown();
              }}
            />
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text="Delete"
              onClick={() => {
                handleDeleteSSOIdentityProvider(SSOIdp.id);
                closeDropdown();
              }}
            />
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      }
    />
  );
};
