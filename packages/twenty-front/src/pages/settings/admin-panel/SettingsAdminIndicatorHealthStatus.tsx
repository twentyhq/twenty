import { SettingsAdminHealthStatusRightContainer } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthStatusRightContainer';
import { SettingsAdminIndicatorHealthStatusContent } from '@/settings/admin-panel/health-status/components/SettingsAdminIndicatorHealthStatusContent';
import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { H2Title, Section } from 'twenty-ui';
import {
  AdminPanelHealthServiceStatus,
  HealthIndicatorId,
  useGetIndicatorHealthStatusQuery,
} from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledH2Title = styled(H2Title)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledHealthStatusContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(1)};
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
          href: getSettingsPath(SettingsPath.ServerAdmin),
        },
        {
          children: t`Server Admin`,
          href: getSettingsPath(SettingsPath.ServerAdmin),
        },
        {
          children: t`Health Status`,
          href: getSettingsPath(SettingsPath.ServerAdminHealthStatus),
        },
        { children: `${data?.getIndicatorHealthStatus?.label}` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsAdminIndicatorHealthContext.Provider
          value={{
            indicatorHealth: {
              id: data?.getIndicatorHealthStatus?.id ?? '',
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
              <StyledH2Title
                title={`${data?.getIndicatorHealthStatus?.label}`}
                description={data?.getIndicatorHealthStatus?.description}
              />
              {indicatorId !== HealthIndicatorId.connectedAccount &&
                data?.getIndicatorHealthStatus?.status && (
                  <StyledHealthStatusContainer>
                    <SettingsAdminHealthStatusRightContainer
                      status={data?.getIndicatorHealthStatus.status}
                    />
                  </StyledHealthStatusContainer>
                )}
            </StyledTitleContainer>
          </Section>

          <SettingsAdminIndicatorHealthStatusContent />
        </SettingsAdminIndicatorHealthContext.Provider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
