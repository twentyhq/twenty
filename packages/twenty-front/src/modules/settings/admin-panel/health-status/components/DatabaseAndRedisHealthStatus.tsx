import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { Section } from 'twenty-ui';
import { AdminPanelHealthServiceStatus } from '~/generated/graphql';

const StyledDetailsContainer = styled.pre`
  background-color: ${({ theme }) => theme.background.quaternary};
  padding: ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  white-space: pre-wrap;
  font-size: ${({ theme }) => theme.font.size.sm};
  margin: 0;
`;

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const DatabaseAndRedisHealthStatus = () => {
  const { indicatorHealth, loading } = useContext(
    SettingsAdminIndicatorHealthContext,
  );

  const formattedDetails = indicatorHealth.details
    ? JSON.stringify(JSON.parse(indicatorHealth.details), null, 2)
    : null;

  const isDatabaseOrRedisDown =
    !indicatorHealth.status ||
    indicatorHealth.status === AdminPanelHealthServiceStatus.OUTAGE;

  return (
    <Section>
      {isDatabaseOrRedisDown && !loading ? (
        <StyledErrorMessage>
          {`${indicatorHealth.label} information is not available because the service is down`}
        </StyledErrorMessage>
      ) : (
        <StyledDetailsContainer>{formattedDetails}</StyledDetailsContainer>
      )}
    </Section>
  );
};
