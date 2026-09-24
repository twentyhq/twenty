import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownRootContent } from '@/ui/layout/dropdown/components/DropdownRootContent';
import { useDeleteSsoIdentityProvider } from '@/settings/security/hooks/useDeleteSsoIdentityProvider';
import { useUpdateSsoIdentityProvider } from '@/settings/security/hooks/useUpdateSsoIdentityProvider';
import { type SsoIdentityProvider } from '@/settings/security/types/SsoIdentityProvider';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown, LightIconButton, useToast } from 'twenty-ui/components';
import { IconArchive, IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { SsoIdentityProviderStatus } from '~/generated-metadata/graphql';

type SettingsSecuritySsoRowDropdownMenuProps = {
  ssoIdp: Omit<SsoIdentityProvider, '__typename'>;
};

export const SettingsSecuritySsoRowDropdownMenu = ({
  ssoIdp,
}: SettingsSecuritySsoRowDropdownMenuProps) => {
  const dropdownId = `settings-account-row-${ssoIdp.id}`;
  const { enqueueToast } = useToast();

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
    <DropdownRoot type="menu" dropdownId={dropdownId}>
      <Dropdown.Trigger
        render={
          <LightIconButton emphasis="subtle" aria-label={t`More options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownRootContent side="right" align="start">
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconArchive />}
            onClick={() => {
              toggleSsoIdentityProviderStatus(ssoIdp.id);
            }}
          >
            {ssoIdp.status === 'Active' ? t`Deactivate` : t`Activate`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconTrash />}
            onClick={() => {
              handleDeleteSsoIdentityProvider(ssoIdp.id);
            }}
          >{t`Delete`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownRootContent>
    </DropdownRoot>
  );
};
