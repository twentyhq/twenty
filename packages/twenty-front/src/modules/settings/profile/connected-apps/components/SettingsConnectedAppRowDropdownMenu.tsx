import { SettingsRevokeAccessDropdownMenu } from '@/settings/components/SettingsRevokeAccessDropdownMenu';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';
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
    <SettingsRevokeAccessDropdownMenu
      dropdownId={dropdownId}
      onRevokeAccess={() => void handleRevokeAccess()}
    />
  );
};
