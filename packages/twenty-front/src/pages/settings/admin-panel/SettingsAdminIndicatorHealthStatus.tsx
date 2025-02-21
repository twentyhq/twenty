import { SettingsAdminHealthStatusRightContainer } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthStatusRightContainer';
import { SettingsAdminIndicatorHealthStatusContent } from '@/settings/admin-panel/health-status/components/SettingsAdminIndicatorHealthStatusContent';
import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
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

export const SettingsAdminIndicatorHealthStatus = () => {
  const { t } = useLingui();
  const { indicatorId } = useParams();
  const { data, loading } = useGetIndicatorHealthStatusQuery({
    variables: {
      indicatorId: indicatorId as HealthIndicatorId,
    },
    fetchPolicy: 'network-only',
  });

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Server Admin Panel`,
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
              id: data?.getIndicatorHealthStatus?.id ?? '',
              label: data?.getIndicatorHealthStatus?.label ?? '',
              description: data?.getIndicatorHealthStatus?.description ?? '',
              status:
                data?.getIndicatorHealthStatus?.status ??
                AdminPanelHealthServiceStatus.OUTAGE,
              details: data?.getIndicatorHealthStatus?.details,
              queues: data?.getIndicatorHealthStatus?.queues,
            },
            loading: loading,
          }}
        >
          <Section>
            <StyledH2Title
              title={`${data?.getIndicatorHealthStatus?.label}`}
              description={data?.getIndicatorHealthStatus?.description}
            />
            {indicatorId !== HealthIndicatorId.connectedAccount &&
              data?.getIndicatorHealthStatus?.status && (
                <SettingsAdminHealthStatusRightContainer
                  status={data?.getIndicatorHealthStatus.status}
                />
              )}
          </Section>

          <SettingsAdminIndicatorHealthStatusContent />
        </SettingsAdminIndicatorHealthContext.Provider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
