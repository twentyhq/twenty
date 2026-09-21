import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { useDeleteSsoIdentityProvider } from '@/settings/security/hooks/useDeleteSsoIdentityProvider';
import { useUpdateSsoIdentityProvider } from '@/settings/security/hooks/useUpdateSsoIdentityProvider';
import { type SsoIdentityProvider } from '@/settings/security/types/SsoIdentityProvider';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/primitives/feedback';
import { IconArchive, IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { SsoIdentityProviderStatus } from '~/generated-metadata/graphql';

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
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      clickableComponent={
        <LightIconButton emphasis="subtle" aria-label={t`More options`}>
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <ListItem
              startIcon={<IconArchive />}
              onClick={getDropdownMenuItemClickHandler(() => {
                toggleSsoIdentityProviderStatus(ssoIdp.id);
                closeDropdown(dropdownId);
              })}
            >
              <OverflowingTextWithTooltip
                text={ssoIdp.status === 'Active' ? t`Deactivate` : t`Activate`}
              />
            </ListItem>
            <ListItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={getDropdownMenuItemClickHandler(() => {
                handleDeleteSsoIdentityProvider(ssoIdp.id);
                closeDropdown(dropdownId);
              })}
            >
              <OverflowingTextWithTooltip text={t`Delete`} />
            </ListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
