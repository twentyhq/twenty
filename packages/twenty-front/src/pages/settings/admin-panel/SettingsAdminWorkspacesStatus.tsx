import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminWorkspacesByHealthAccordion } from '@/settings/admin-panel/health-status/components/SettingsAdminWorkspacesByHealthAccordion';
import { SettingsAdminWorkspacesStatusSummaryCard } from '@/settings/admin-panel/health-status/components/SettingsAdminWorkspacesStatusSummaryCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  GetInstanceAndAllWorkspacesUpgradeStatusDocument,
  RefreshUpgradeStatusDocument,
} from '~/generated-admin/graphql';

const StyledRefreshButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledAccordionCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

export const SettingsAdminWorkspacesStatus = () => {
  const apolloAdminClient = useApolloAdminClient();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const {
    data,
    refetch,
    loading: isLoadingUpgradeStatus,
  } = useQuery(GetInstanceAndAllWorkspacesUpgradeStatusDocument, {
    client: apolloAdminClient,
    fetchPolicy: 'network-only',
  });
  const [refreshUpgradeStatus, { loading: isRefreshingUpgradeStatus }] =
    useMutation(RefreshUpgradeStatusDocument, {
      client: apolloAdminClient,
    });

  const upgradeStatus = data?.getInstanceAndAllWorkspacesUpgradeStatus;
  const behindCount = upgradeStatus?.workspacesBehind.length ?? 0;
  const failedCount = upgradeStatus?.workspacesFailed.length ?? 0;

  const handleRefreshUpgradeStatus = async () => {
    try {
      await refreshUpgradeStatus();
      await refetch();
      enqueueSuccessSnackBar({
        message: t`Upgrade status refreshed`,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Failed to refresh upgrade status`,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel - Health`,
          href: getSettingsPath(SettingsPath.AdminPanelHealthStatus),
        },
        {
          children: t`Workspaces status`,
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Workspaces status`}
            description={t`Upgrade health across all workspaces`}
          />
          <SettingsAdminWorkspacesStatusSummaryCard
            behindCount={behindCount}
            failedCount={failedCount}
            computedAt={upgradeStatus?.computedAt}
          />
          <StyledRefreshButtonContainer>
            <Button
              variant="secondary"
              title={t`Refresh status`}
              onClick={handleRefreshUpgradeStatus}
              disabled={isRefreshingUpgradeStatus || isLoadingUpgradeStatus}
            />
          </StyledRefreshButtonContainer>
        </Section>
        <Section>
          <H2Title
            title={t`Detail per workspace`}
            description={t`Workspace lists by upgrade status`}
          />
          <StyledAccordionCardsContainer>
            <SettingsAdminWorkspacesByHealthAccordion
              filledLabel={plural(behindCount, {
                one: '# workspace behind',
                other: '# workspaces behind',
              })}
              emptyLabel={t`No workspace behind`}
              workspaces={upgradeStatus?.workspacesBehind ?? []}
              defaultExpanded={true}
            />
            <SettingsAdminWorkspacesByHealthAccordion
              filledLabel={plural(failedCount, {
                one: '# workspace failed',
                other: '# workspaces failed',
              })}
              emptyLabel={t`No workspace failed`}
              workspaces={upgradeStatus?.workspacesFailed ?? []}
            />
          </StyledAccordionCardsContainer>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
