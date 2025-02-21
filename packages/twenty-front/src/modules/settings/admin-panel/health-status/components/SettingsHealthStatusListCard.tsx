import styled from '@emotion/styled';

import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsPath } from '@/types/SettingsPath';
import { useTheme } from '@emotion/react';
import { Link } from 'react-router-dom';
import { IconChevronRight } from 'twenty-ui';
import { HealthIndicatorId, SystemHealthService } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsAdminHealthStatusRightContainer } from './SettingsAdminHealthStatusRightContainer';
const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const SettingsHealthStatusListCard = ({
  services,
  loading,
}: {
  services: Array<SystemHealthService>;
  loading?: boolean;
}) => {
  const theme = useTheme();
  return (
    <>
      {services.map((service) => (
        <StyledLink
          key={service.id}
          to={getSettingsPath(SettingsPath.AdminPanelIndicatorHealthStatus, {
            indicatorId: service.id,
          })}
        >
          <SettingsListCard
            items={[service]}
            getItemLabel={(service) => service.label}
            isLoading={loading}
            RowRightComponent={({ item: service }) => (
              <>
                {service.id === HealthIndicatorId.connectedAccount ? (
                  <IconChevronRight size={theme.icon.size.sm} />
                ) : (
                  <SettingsAdminHealthStatusRightContainer
                    status={service.status}
                  />
                )}
              </>
            )}
          />
        </StyledLink>
      ))}
    </>
  );
};
