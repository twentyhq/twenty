import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { Section } from 'twenty-ui/layout';
import { AdminPanelHealthServiceStatus } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledDetailsContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  padding: ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.border.radius.md};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  font-size: ${({ theme }) => theme.font.size.sm};
  overflow-x: auto;
`;

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  margin-top: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsAdminJsonDataIndicatorHealthStatus = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  const { indicatorHealth } = useContext(SettingsAdminIndicatorHealthContext);

  const parsedDetails = indicatorHealth.details
    ? JSON.parse(indicatorHealth.details)
    : null;

  const isDown =
    !indicatorHealth.status ||
    indicatorHealth.status === AdminPanelHealthServiceStatus.OUTAGE;

  const isAnyNode = () => true;

  const serviceLabel = indicatorHealth.label;

  return (
    <Section>
      {isDown && (
        <StyledErrorMessage>
          {indicatorHealth.errorMessage ||
            t`${serviceLabel} service is unreachable`}
        </StyledErrorMessage>
      )}
      {parsedDetails && (
        <StyledDetailsContainer>
          <JsonTree
            value={parsedDetails}
            shouldExpandNodeInitially={isAnyNode}
            emptyArrayLabel={t`Empty Array`}
            emptyObjectLabel={t`Empty Object`}
            emptyStringLabel={t`[empty string]`}
            arrowButtonCollapsedLabel={t`Expand`}
            arrowButtonExpandedLabel={t`Collapse`}
            onNodeValueClick={copyToClipboard}
          />
        </StyledDetailsContainer>
      )}
    </Section>
  );
};
