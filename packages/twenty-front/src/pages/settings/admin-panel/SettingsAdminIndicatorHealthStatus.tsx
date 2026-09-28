import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminHealthStatusRightContainer } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthStatusRightContainer';
import { SettingsAdminIndicatorHealthStatusContent } from '@/settings/admin-panel/health-status/components/SettingsAdminIndicatorHealthStatusContent';
import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { Heading } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { useQuery } from '@apollo/client/react';
import {
  AdminPanelHealthServiceStatus,
  HealthIndicatorId,
  GetIndicatorHealthStatusDocument,
} from '~/generated-admin/graphql';

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[2]};

  h3 {
    line-height: inherit;
  }
`;

export const SettingsAdminIndicatorHealthStatus = () => {
  const { t } = useLingui();
  const { indicatorId } = useParams();
  const apolloAdminClient = useApolloAdminClient();
  const { data, loading: loadingIndicatorHealthStatus } = useQuery(
    GetIndicatorHealthStatusDocument,
    {
      client: apolloAdminClient,
      variables: {
        indicatorId: indicatorId as HealthIndicatorId,
      },
      fetchPolicy: 'network-only',
    },
  );

  if (loadingIndicatorHealthStatus) {
    return <SettingsSkeletonLoader />;
  }

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
        { children: `${data?.getIndicatorHealthStatus?.label}` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsAdminIndicatorHealthContext.Provider
          value={{
            indicatorHealth: {
              id: data?.getIndicatorHealthStatus?.id ?? HealthIndicatorId.app,
              label: data?.getIndicatorHealthStatus?.label ?? '',
              description: data?.getIndicatorHealthStatus?.description ?? '',
              errorMessage: data?.getIndicatorHealthStatus?.errorMessage,
              status:
                data?.getIndicatorHealthStatus?.status ??
                AdminPanelHealthServiceStatus.OUTAGE,
              details: data?.getIndicatorHealthStatus?.details,
              queues: data?.getIndicatorHealthStatus?.queues,
            },
          }}
        >
          <Section.Root>
            <StyledTitleContainer>
              <Heading level={3} size="lg">
                {data?.getIndicatorHealthStatus?.label}
              </Heading>
              {data?.getIndicatorHealthStatus?.status && (
                <SettingsAdminHealthStatusRightContainer
                  status={data?.getIndicatorHealthStatus.status}
                />
              )}
            </StyledTitleContainer>
          </Section.Root>
          <Section.Root>
            {data?.getIndicatorHealthStatus?.id !== HealthIndicatorId.worker &&
              data?.getIndicatorHealthStatus?.id !==
                HealthIndicatorId.connectedAccount && (
                <Section.Header
                  title={t`Status`}
                  description={data?.getIndicatorHealthStatus?.description}
                />
              )}
            <SettingsAdminIndicatorHealthStatusContent />
          </Section.Root>
        </SettingsAdminIndicatorHealthContext.Provider>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
