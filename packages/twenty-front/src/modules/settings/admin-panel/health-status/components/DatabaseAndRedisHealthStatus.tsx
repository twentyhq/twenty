import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { Section } from 'twenty-ui';

const StyledDetailsContainer = styled.pre`
  background-color: ${({ theme }) => theme.background.quaternary};
  padding: ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  white-space: pre-wrap;
  font-size: ${({ theme }) => theme.font.size.sm};
`;
export const DatabaseAndRedisHealthStatus = () => {
  const { indicatorHealth } = useContext(SettingsAdminIndicatorHealthContext);

  const formattedDetails = indicatorHealth.details
    ? JSON.stringify(JSON.parse(indicatorHealth.details), null, 2)
    : null;

  return (
    <Section>
      <StyledDetailsContainer>{formattedDetails}</StyledDetailsContainer>
    </Section>
  );
};
