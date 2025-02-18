import { AdminHealthService } from '@/settings/admin-panel/types/AdminHealthService';
import styled from '@emotion/styled';

import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsPath } from '@/types/SettingsPath';
import { useTheme } from '@emotion/react';
import { Link } from 'react-router-dom';
import { IconChevronRight } from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsAdminHealthStatusRightContainer } from './SettingsAdminHealthStatusRightContainer';

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const SettingsHealthStatusListCard = ({
  services,
  loading,
}: {
  services: Array<AdminHealthService>;
  loading?: boolean;
}) => {
  const theme = useTheme();
  return (
    <>
      {services.map((service) => (
        <StyledLink
          to={getSettingsPath(SettingsPath.AdminPanelIndicatorHealthStatus, {
            indicatorName: service.id,
          })}
        >
          <SettingsListCard
            items={[service]}
            getItemLabel={(service) => service.name}
            isLoading={loading}
            RowRightComponent={({ item: service }) => (
              <>
                {service.id === 'ACCOUNT_SYNC' ? (
                  <IconChevronRight size={theme.icon.size.sm} />
                ) : (
                  <SettingsAdminHealthStatusRightContainer service={service} />
                )}
              </>
            )}
          />
        </StyledLink>
      ))}
    </>
  );
};
