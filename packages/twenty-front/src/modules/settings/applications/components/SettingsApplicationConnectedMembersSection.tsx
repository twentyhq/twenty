import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { SettingsApplicationConnectedMemberActionsCell } from '@/settings/applications/components/SettingsApplicationConnectedMemberActionsCell';
import { SettingsApplicationConnectedMemberLastUsedCell } from '@/settings/applications/components/SettingsApplicationConnectedMemberLastUsedCell';
import { SettingsApplicationConnectedMemberNameCell } from '@/settings/applications/components/SettingsApplicationConnectedMemberNameCell';
import { getApplicationConnectedMembers } from '@/settings/applications/utils/getApplicationConnectedMembers';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { WorkspaceApplicationAuthorizationsDocument } from '~/generated-metadata/graphql';

type SettingsApplicationConnectedMembersSectionProps = {
  applicationId: string;
};

export const SettingsApplicationConnectedMembersSection = ({
  applicationId,
}: SettingsApplicationConnectedMembersSectionProps) => {
  const { t } = useLingui();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const { data, error } = useQuery(WorkspaceApplicationAuthorizationsDocument, {
    variables: { applicationId },
    fetchPolicy: 'cache-and-network',
  });

  const connectedMembers = getApplicationConnectedMembers({
    applicationAuthorizations: data?.workspaceApplicationAuthorizations ?? [],
    workspaceMembers: currentWorkspaceMembers,
  });

  return (
    <>
      <ToastOnQueryErrorEffect error={error} />
      {isNonEmptyArray(connectedMembers) && (
        <SettingsTableListSection
          title={t`Connected members`}
          description={t`Members who let this app access the workspace on their behalf`}
          items={connectedMembers}
          gridAutoColumns="3fr 2fr 1fr"
          columns={[
            {
              label: t`Name`,
              overflow: 'hidden',
              Cell: SettingsApplicationConnectedMemberNameCell,
            },
            {
              label: t`Last used`,
              Cell: SettingsApplicationConnectedMemberLastUsedCell,
            },
            {
              label: '',
              align: 'right',
              Cell: SettingsApplicationConnectedMemberActionsCell,
            },
          ]}
        />
      )}
    </>
  );
};
