import { useDeleteSsoIdentityProvider } from '@/settings/security/hooks/useDeleteSsoIdentityProvider';
import { useUpdateSsoIdentityProvider } from '@/settings/security/hooks/useUpdateSsoIdentityProvider';
import { type SsoIdentityProvider } from '@/settings/security/types/SsoIdentityProvider';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconArchive, IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { SsoIdentityProviderStatus } from '~/generated-metadata/graphql';

type SettingsSecuritySsoRowDropdownMenuProps = {
  ssoIdp: Omit<SsoIdentityProvider, '__typename'>;
};

export const SettingsSecuritySsoRowDropdownMenu = ({
  ssoIdp,
}: SettingsSecuritySsoRowDropdownMenuProps) => {
  const dropdownId = `settings-account-row-${ssoIdp.id}`;

  const { enqueueErrorSnackBar } = useSnackBar();

  const { closeDropdown } = useCloseDropdown();

  const { deleteSsoIdentityProvider } = useDeleteSsoIdentityProvider();
  const { updateSsoIdentityProvider } = useUpdateSsoIdentityProvider();

  const { t } = useLingui();

  const handleDeleteSsoIdentityProvider = async (
    identityProviderId: string,
  ) => {
    const result = await deleteSsoIdentityProvider({
      identityProviderId,
    });
    if (isDefined(result.error)) {
      enqueueErrorSnackBar({
        message: t`Error deleting SSO Identity Provider`,
        options: {
          duration: 2000,
        },
      });
    }
  };

  const toggleSsoIdentityProviderStatus = async (
    identityProviderId: string,
  ) => {
    const result = await updateSsoIdentityProvider({
      id: identityProviderId,
      status:
        ssoIdp.status === 'Active'
          ? SsoIdentityProviderStatus.Inactive
          : SsoIdentityProviderStatus.Active,
    });
    if (isDefined(result.error)) {
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
        <LightIconButton
          Icon={IconDotsVertical}
          accent="tertiary"
          aria-label={t`More options`}
        />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <MenuItem
              accent="default"
              LeftIcon={IconArchive}
              text={ssoIdp.status === 'Active' ? t`Deactivate` : t`Activate`}
              onClick={() => {
                toggleSsoIdentityProviderStatus(ssoIdp.id);
                closeDropdown(dropdownId);
              }}
            />
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text={t`Delete`}
              onClick={() => {
                handleDeleteSsoIdentityProvider(ssoIdp.id);
                closeDropdown(dropdownId);
              }}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
