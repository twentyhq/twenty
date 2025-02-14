import { AdminHealthService } from '@/settings/admin-panel/types/AdminHealthService';
import styled from '@emotion/styled';
import { Status } from 'twenty-ui';
import { AdminPanelHealthServiceStatus } from '~/generated/graphql';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsAdminHealthStatusRightContainer = ({
  service,
}: {
  service: AdminHealthService;
}) => {
  return (
    <StyledRowRightContainer>
      {service.status === AdminPanelHealthServiceStatus.OPERATIONAL && (
        <Status color="green" text="Operational" weight="medium" />
      )}
      {service.status === AdminPanelHealthServiceStatus.OUTAGE && (
        <Status color="red" text="Outage" weight="medium" />
      )}
    </StyledRowRightContainer>
  );
};
