import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import { JsonTree } from '@/workflow/components/json-visualizer/components/JsonTree';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { Section } from 'twenty-ui';
import { AdminPanelHealthServiceStatus } from '~/generated/graphql';

const StyledDetailsContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  padding: ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.border.radius.md};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  white-space: pre-wrap;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  margin-top: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const JsonDataIndicatorHealthStatus = () => {
  const { indicatorHealth } = useContext(SettingsAdminIndicatorHealthContext);

  const parsedDetails = indicatorHealth.details
    ? JSON.parse(indicatorHealth.details)
    : null;

  const isDown =
    !indicatorHealth.status ||
    indicatorHealth.status === AdminPanelHealthServiceStatus.OUTAGE;

  return (
    <Section>
      {isDown && (
        <StyledErrorMessage>
          {indicatorHealth.errorMessage ||
            `${indicatorHealth.label} service is unreachable`}
        </StyledErrorMessage>
      )}
      {parsedDetails && (
        <StyledDetailsContainer>
          <JsonTree value={parsedDetails} />
        </StyledDetailsContainer>
      )}
    </Section>
  );
};
