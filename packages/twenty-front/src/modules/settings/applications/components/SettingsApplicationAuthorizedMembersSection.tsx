import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { SettingsApplicationAuthorizationPermissionsCell } from '@/settings/applications/components/SettingsApplicationAuthorizationPermissionsCell';
import { SettingsApplicationAuthorizationRowDropdownMenu } from '@/settings/applications/components/SettingsApplicationAuthorizationRowDropdownMenu';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsApplicationTableHeaderRow } from '@/settings/applications/components/SettingsApplicationTableHeaderRow';
import { SettingsApplicationTableRow } from '@/settings/applications/components/SettingsApplicationTableRow';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import {
  RevokeWorkspaceApplicationAuthorizationDocument,
  WorkspaceApplicationAuthorizationsDocument,
} from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

type SettingsApplicationAuthorizedMembersSectionProps = {
  applicationId: string;
  applicationName: string;
};

export const SettingsApplicationAuthorizedMembersSection = ({
  applicationId,
  applicationName,
}: SettingsApplicationAuthorizedMembersSectionProps) => {
  const { t } = useLingui();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { data, loading, error, refetch } = useQuery(
    WorkspaceApplicationAuthorizationsDocument,
    { variables: { applicationId }, fetchPolicy: 'cache-and-network' },
  );
  const [revokeWorkspaceApplicationAuthorization] = useMutation(
    RevokeWorkspaceApplicationAuthorizationDocument,
    {
      refetchQueries: [
        {
          query: WorkspaceApplicationAuthorizationsDocument,
          variables: { applicationId },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  const authorizations = data?.workspaceApplicationAuthorizations ?? [];
  const workspaceMemberByUserId = new Map(
    currentWorkspaceMembers.map((workspaceMember) => [
      workspaceMember.userId,
      workspaceMember,
    ]),
  );

  const renderContent = () => {
    if (loading && !isDefined(data)) {
      return <SettingsSectionSkeletonLoader />;
    }

    if (isDefined(error) && !isDefined(data)) {
      return (
        <SettingsApplicationLoadErrorBanner
          message={t`Connected members could not be loaded. Check your connection and try again.`}
          onRetry={() => refetch().catch(() => undefined)}
        />
      );
    }

    if (authorizations.length === 0) {
      return null;
    }

    return (
      <Table>
        <SettingsApplicationTableHeaderRow
          middleColumn="status"
          nameLabel={t`Member`}
          middleLabel={t`Last used`}
          detailsLabel={t`Permissions`}
          detailsAlign="left"
          shouldShowDetailsOnMobile
        />
        <StyledTableRows>
          {authorizations.map((authorization) => {
            const workspaceMember = workspaceMemberByUserId.get(
              authorization.userId,
            );
            const memberName = isDefined(workspaceMember)
              ? getWorkspaceMemberNameOrEmail(workspaceMember)
              : t`Former member`;

            return (
              <SettingsApplicationTableRow
                key={authorization.id}
                middleColumn="status"
                hasActionMenu
                name={
                  <>
                    <Avatar
                      src={getAbsoluteImageUrl(workspaceMember?.avatarUrl)}
                      colorSeed={workspaceMember?.id}
                      name={memberName}
                      shape="circle"
                      size="md"
                    />
                    <OverflowingTextWithTooltip text={memberName} />
                  </>
                }
                middle={beautifyPastDateRelativeToNowShort(
                  authorization.lastUsedAt,
                )}
                details={
                  <SettingsApplicationAuthorizationPermissionsCell
                    authorization={authorization}
                  />
                }
                detailsAlign="left"
                shouldShowDetailsOnMobile
                action={
                  <SettingsApplicationAuthorizationRowDropdownMenu
                    applicationAuthorizationId={authorization.id}
                    revokeLabel={t`Revoke access`}
                    confirmationTitle={t`Revoke ${memberName}'s access?`}
                    confirmationSubtitle={
                      <Trans>
                        {applicationName} will lose access to this workspace on
                        behalf of {memberName} when its current access token
                        expires.
                      </Trans>
                    }
                    onRevoke={(applicationAuthorizationId) =>
                      revokeWorkspaceApplicationAuthorization({
                        variables: { applicationAuthorizationId },
                      })
                    }
                  />
                }
              />
            );
          })}
        </StyledTableRows>
      </Table>
    );
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Connected members`}
        description={t`Each member connects with their own account, and ${applicationName} acts with that member's permissions.`}
      />
      {renderContent()}
    </Section.Root>
  );
};
