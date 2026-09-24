import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section, useToast } from 'twenty-ui/components';
import { IconId } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
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
  const { enqueueToast } = useToast();

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
      enqueueToast({
        variant: 'success',
        children: t`Upgrade status refreshed`,
      });
    } catch (error) {
      enqueueToast({
        variant: 'error',
        children:
          error instanceof Error
            ? error.message
            : t`Failed to refresh upgrade status`,
      });
    }
  };

  return (
    <SettingsPageLayout
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
        <Section.Root>
          <Section.Header
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
              onClick={handleRefreshUpgradeStatus}
              disabled={isRefreshingUpgradeStatus || isLoadingUpgradeStatus}
              variant="outline"
            >{t`Refresh status`}</Button>
          </StyledRefreshButtonContainer>
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
