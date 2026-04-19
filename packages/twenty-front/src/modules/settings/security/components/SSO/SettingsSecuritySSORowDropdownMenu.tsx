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
import { IconArchive, IconDotsVertical, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { SsoIdentityProviderStatus } from '~/generated-metadata/graphql';

type SettingsSecuritySsoRowDropdownMenuProps = {
  SsoIdp: Omit<SsoIdentityProvider, '__typename'>;
};

export const SettingsSecuritySsoRowDropdownMenu = ({
  SsoIdp,
}: SettingsSecuritySsoRowDropdownMenuProps) => {
  const dropdownId = `settings-account-row-${SsoIdp.id}`;

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
        message: t`Error deleting Sso Identity Provider`,
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
        SsoIdp.status === 'Active'
          ? SsoIdentityProviderStatus.Inactive
          : SsoIdentityProviderStatus.Active,
    });
    if (isDefined(result.error)) {
      enqueueErrorSnackBar({
        message: t`Error editing Sso Identity Provider`,
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
              text={SsoIdp.status === 'Active' ? t`Deactivate` : t`Activate`}
              onClick={() => {
                toggleSsoIdentityProviderStatus(SsoIdp.id);
                closeDropdown(dropdownId);
              }}
            />
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text={t`Delete`}
              onClick={() => {
                handleDeleteSsoIdentityProvider(SsoIdp.id);
                closeDropdown(dropdownId);
              }}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
