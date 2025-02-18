import { AdminHealthService } from '@/settings/admin-panel/types/AdminHealthService';
import styled from '@emotion/styled';

import { SettingsListCard } from '../../components/SettingsListCard';
import { SettingsAdminHealthStatusRightContainer } from './SettingsAdminHealthStatusRightContainer';

const StyledDetailsContainer = styled.pre`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  white-space: pre-wrap;
`;

export const SettingsHealthStatusListCard = ({
  services,
  loading,
  onServiceClick,
  expandedService,
}: {
  services: Array<AdminHealthService>;
  loading?: boolean;
  onServiceClick: (serviceId: string) => void;
  expandedService: string | null;
}) => {
  return (
    <>
      {services.map((service) => (
        <>
          <SettingsListCard
            items={[service]}
            getItemLabel={(service) => service.name}
            isLoading={loading}
            onRowClick={(service) => onServiceClick(service.id)}
            RowRightComponent={({ item: service }) => (
              <SettingsAdminHealthStatusRightContainer service={service} />
            )}
          />
          {service.details && expandedService === service.id && (
            <StyledDetailsContainer key={`${service.id}-details`}>
              {JSON.stringify(JSON.parse(service.details), null, 2)}
            </StyledDetailsContainer>
          )}
        </>
      ))}
    </>
  );
};
