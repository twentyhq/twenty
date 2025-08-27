import { useDeleteSSOIdentityProvider } from '@/settings/security/hooks/useDeleteSSOIdentityProvider';
import { useUpdateSSOIdentityProvider } from '@/settings/security/hooks/useUpdateSSOIdentityProvider';
import { type SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { type UnwrapRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconArchive, IconDotsVertical, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { SsoIdentityProviderStatus } from '~/generated/graphql';

type SettingsSecuritySSORowDropdownMenuProps = {
  SSOIdp: UnwrapRecoilValue<typeof SSOIdentitiesProvidersState>[0];
};

export const SettingsSecuritySSORowDropdownMenu = ({
  SSOIdp,
}: SettingsSecuritySSORowDropdownMenuProps) => {
  const dropdownId = `settings-account-row-${SSOIdp.id}`;

  const { enqueueErrorSnackBar } = useSnackBar();

  const { closeDropdown } = useCloseDropdown();

  const { deleteSSOIdentityProvider } = useDeleteSSOIdentityProvider();
  const { updateSSOIdentityProvider } = useUpdateSSOIdentityProvider();

  const { t } = useLingui();

  const handleDeleteSSOIdentityProvider = async (
    identityProviderId: string,
  ) => {
    const result = await deleteSSOIdentityProvider({
      identityProviderId,
    });
    if (isDefined(result.errors)) {
      enqueueErrorSnackBar({
        message: t`Error deleting SSO Identity Provider`,
        options: {
          duration: 2000,
        },
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
      enqueueErrorSnackBar({
        message: t`Error editing SSO Identity Provider`,
        options: {
          duration: 2000,
        },
      });
    }
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <MenuItem
              accent="default"
              LeftIcon={IconArchive}
              text={SSOIdp.status === 'Active' ? t`Deactivate` : t`Activate`}
              onClick={() => {
                toggleSSOIdentityProviderStatus(SSOIdp.id);
                closeDropdown(dropdownId);
              }}
            />
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text={t`Delete`}
              onClick={() => {
                handleDeleteSSOIdentityProvider(SSOIdp.id);
                closeDropdown(dropdownId);
              }}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
