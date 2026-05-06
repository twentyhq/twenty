import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconId } from 'twenty-ui/display';
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

export const SettingsAdminInferredVersion = () => {
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

  const inferredVersion =
    data?.getInstanceAndAllWorkspacesUpgradeStatus.instanceUpgradeStatus
      .inferredVersion;

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
          children: t`Inferred version`,
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Inferred version`}
            description={t`Detected application version running on this instance`}
          />
          <SettingsTableCard
            items={[
              {
                Icon: IconId,
                label: t`Inferred version`,
                value: inferredVersion ?? t`Unknown`,
              },
            ]}
            gridAutoColumns="3fr 4fr"
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
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
