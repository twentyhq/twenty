import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { AdminPanelHealthServiceStatus } from '~/generated-admin/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledDetailsContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  font-size: ${themeCssVariables.font.size.sm};
  overflow-x: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledErrorMessage = styled.div`
  color: ${themeCssVariables.color.red};
  margin-bottom: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[2]};
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
