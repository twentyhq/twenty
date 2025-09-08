import { SettingsAdminHealthStatusRightContainer } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthStatusRightContainer';
import { SettingsAdminIndicatorHealthStatusContent } from '@/settings/admin-panel/health-status/components/SettingsAdminIndicatorHealthStatusContent';
import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, H3Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  AdminPanelHealthServiceStatus,
  HealthIndicatorId,
  useGetIndicatorHealthStatusQuery,
} from '~/generated-metadata/graphql';

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAdminIndicatorHealthStatus = () => {
  const { t } = useLingui();
  const { indicatorId } = useParams();
  const { data, loading: loadingIndicatorHealthStatus } =
    useGetIndicatorHealthStatusQuery({
      variables: {
        indicatorId: indicatorId as HealthIndicatorId,
      },
      fetchPolicy: 'network-only',
    });

  if (loadingIndicatorHealthStatus) {
    return <SettingsSkeletonLoader />;
  }

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Health Status`,
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
          <Section>
            <StyledTitleContainer>
              <H3Title title={data?.getIndicatorHealthStatus?.label} />
              {data?.getIndicatorHealthStatus?.status && (
                <SettingsAdminHealthStatusRightContainer
                  status={data?.getIndicatorHealthStatus.status}
                />
              )}
            </StyledTitleContainer>
          </Section>
          <Section>
            {data?.getIndicatorHealthStatus?.id !== HealthIndicatorId.worker &&
              data?.getIndicatorHealthStatus?.id !==
                HealthIndicatorId.connectedAccount && (
                <H2Title
                  title={t`Status`}
                  description={data?.getIndicatorHealthStatus?.description}
                />
              )}
            <SettingsAdminIndicatorHealthStatusContent />
          </Section>
        </SettingsAdminIndicatorHealthContext.Provider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
