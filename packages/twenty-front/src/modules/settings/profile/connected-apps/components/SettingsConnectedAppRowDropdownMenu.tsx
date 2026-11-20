import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconUnlink } from 'twenty-ui/icon';
import {
  CurrentUserApplicationAuthorizationsDocument,
  type CurrentUserApplicationAuthorizationsQuery,
  RevokeApplicationAuthorizationDocument,
} from '~/generated-metadata/graphql';

type SettingsConnectedAppRowDropdownMenuProps = {
  item: CurrentUserApplicationAuthorizationsQuery['currentUserApplicationAuthorizations'][number];
};

export const SettingsConnectedAppRowDropdownMenu = ({
  item: applicationAuthorization,
}: SettingsConnectedAppRowDropdownMenuProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const dropdownId = `settings-connected-app-row-${applicationAuthorization.id}`;
  const applicationName = applicationAuthorization.applicationName;

  const [revokeApplicationAuthorization] = useMutation(
    RevokeApplicationAuthorizationDocument,
    { refetchQueries: [CurrentUserApplicationAuthorizationsDocument] },
  );

  const handleRevokeAccess = async () => {
    try {
      await revokeApplicationAuthorization({
        variables: { applicationAuthorizationId: applicationAuthorization.id },
      });
      enqueueToast({
        status: 'success',
        children: t`${applicationName} can no longer access your account`,
      });
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Failed to revoke access for ${applicationName}`,
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
      <DropdownContent side="bottom" align="end">
        <Dropdown.Section>
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconUnlink />}
            onClick={handleRevokeAccess}
          >{t`Revoke access`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
