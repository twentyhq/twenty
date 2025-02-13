import styled from '@emotion/styled';
import { Status } from 'twenty-ui';

import { HealthService, HealthServiceStatus } from '~/generated/graphql';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsAdminHealthStatusRightContainer = ({
  service,
}: {
  service: HealthService;
}) => {
  return (
    <StyledRowRightContainer>
      {service.status === HealthServiceStatus.OPERATIONAL && (
        <Status color="green" text="Operational" weight="medium" />
      )}
      {service.status === HealthServiceStatus.DEGRADED && (
        <Status color="orange" text="Degraded" weight="medium" />
      )}
      {service.status === HealthServiceStatus.OUTAGE && (
        <Status color="red" text="Outage" weight="medium" />
      )}
    </StyledRowRightContainer>
  );
};
