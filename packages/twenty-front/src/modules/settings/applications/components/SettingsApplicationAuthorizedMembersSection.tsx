import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { SettingsApplicationAuthorizationPermissionsCell } from '@/settings/applications/components/SettingsApplicationAuthorizationPermissionsCell';
import { SettingsApplicationAuthorizedMemberRowDropdownMenu } from '@/settings/applications/components/SettingsApplicationAuthorizedMemberRowDropdownMenu';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsApplicationTableHeaderRow } from '@/settings/applications/components/SettingsApplicationTableHeaderRow';
import { SettingsApplicationTableRow } from '@/settings/applications/components/SettingsApplicationTableRow';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { WorkspaceApplicationAuthorizationsDocument } from '~/generated-metadata/graphql';
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

  const authorizations = data?.workspaceApplicationAuthorizations ?? [];

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
            const workspaceMember = currentWorkspaceMembers.find(
              (member) => member.userId === authorization.userId,
            );
            const memberName = isDefined(workspaceMember)
              ? `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim() ||
                workspaceMember.userEmail
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
                  <SettingsApplicationAuthorizedMemberRowDropdownMenu
                    applicationAuthorizationId={authorization.id}
                    applicationId={applicationId}
                    applicationName={applicationName}
                    memberName={memberName}
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
