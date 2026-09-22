import { useDeleteSsoIdentityProvider } from '@/settings/security/hooks/useDeleteSsoIdentityProvider';
import { useUpdateSsoIdentityProvider } from '@/settings/security/hooks/useUpdateSsoIdentityProvider';
import { type SsoIdentityProvider } from '@/settings/security/types/SsoIdentityProvider';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/primitives/feedback';
import { IconArchive, IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { SsoIdentityProviderStatus } from '~/generated-metadata/graphql';
import { Menu } from 'twenty-ui/primitives/surfaces';

type SettingsSecuritySsoRowDropdownMenuProps = {
  ssoIdp: Omit<SsoIdentityProvider, '__typename'>;
};

export const SettingsSecuritySsoRowDropdownMenu = ({
  ssoIdp,
}: SettingsSecuritySsoRowDropdownMenuProps) => {
  const dropdownId = `settings-account-row-${ssoIdp.id}`;

  const { enqueueToast } = useToast();

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
      enqueueToast({
        variant: 'error',
        children: t`Error deleting SSO Identity Provider`,
        duration: 2000,
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
      enqueueToast({
        variant: 'error',
        children: t`Error editing SSO Identity Provider`,
        duration: 2000,
      });
    }
  };

  return (
    <DropdownMenu
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      clickableComponent={
        <LightIconButton emphasis="subtle" aria-label={t`More options`}>
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent>
          <Menu.Group>
            <Menu.Item
              startIcon={<IconArchive />}
              onClick={() => {
                toggleSsoIdentityProviderStatus(ssoIdp.id);
                closeDropdown(dropdownId);
              }}
            >
              {ssoIdp.status === 'Active' ? t`Deactivate` : t`Activate`}
            </Menu.Item>
            <Menu.Item
              color="danger"
              startIcon={<IconTrash />}
              onClick={() => {
                handleDeleteSsoIdentityProvider(ssoIdp.id);
                closeDropdown(dropdownId);
              }}
            >{t`Delete`}</Menu.Item>
          </Menu.Group>
        </DropdownContent>
      }
    />
  );
};
