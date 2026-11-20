import { SettingsRevokeAccessDropdownMenu } from '@/settings/components/SettingsRevokeAccessDropdownMenu';
import { type SettingsApplicationConnectedMember } from '@/settings/applications/types/SettingsApplicationConnectedMember';
import { getApplicationConnectedMemberName } from '@/settings/applications/utils/getApplicationConnectedMemberName';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';
import {
  RevokeWorkspaceApplicationAuthorizationDocument,
  WorkspaceApplicationAuthorizationsDocument,
} from '~/generated-metadata/graphql';

export const SettingsApplicationConnectedMemberActionsCell = ({
  item: connectedMember,
}: {
  item: SettingsApplicationConnectedMember;
}) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const dropdownId = `settings-application-connected-member-${connectedMember.id}`;
  const memberName = getApplicationConnectedMemberName(connectedMember);
  const applicationName = connectedMember.applicationName;

  const [revokeWorkspaceApplicationAuthorization] = useMutation(
    RevokeWorkspaceApplicationAuthorizationDocument,
    { refetchQueries: [WorkspaceApplicationAuthorizationsDocument] },
  );

  const handleRevokeAccess = async () => {
    try {
      await revokeWorkspaceApplicationAuthorization({
        variables: { applicationAuthorizationId: connectedMember.id },
      });
      enqueueToast({
        status: 'success',
        children: t`${applicationName} can no longer access the account of ${memberName}`,
      });
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Failed to revoke access for ${memberName}`,
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
