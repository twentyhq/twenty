import { CoreAgentTriggerEditor } from '@/object-core/agents/components/CoreAgentTriggerEditor';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

type CoreAgentTriggerPanelProps = {
  agentId: string;
  triggerId: string;
};

export const CoreAgentTriggerPanel = ({
  agentId,
  triggerId,
}: CoreAgentTriggerPanelProps) => {
  const { t } = useLingui();
  const { validationError } = useCoreAgentEditStatus({ agentId });
  const { goBackFromSidePanel } = useSidePanelHistory();

  return (
    <StyledPage>
      <CoreAgentTriggerEditor agentId={agentId} triggerId={triggerId} />
      {isDefined(validationError) && (
        <Text role="alert">{validationError}</Text>
      )}
      <Text color="tertiary">{t`Save or cancel all changes from the agent settings.`}</Text>
      <Button variant="outline" onClick={goBackFromSidePanel}>{t`Done`}</Button>
    </StyledPage>
  );
};
