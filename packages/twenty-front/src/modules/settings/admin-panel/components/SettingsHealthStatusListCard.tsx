import { AdminHealthService } from '@/settings/admin-panel/types/AdminHealthService';
import styled from '@emotion/styled';

import { SettingsPath } from '@/types/SettingsPath';
import { Link } from 'react-router-dom';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsListCard } from '../../components/SettingsListCard';
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
  return (
    <>
      {services.map((service) => (
        <>
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
                <SettingsAdminHealthStatusRightContainer service={service} />
              )}
            />
          </StyledLink>
        </>
      ))}
    </>
  );
};
