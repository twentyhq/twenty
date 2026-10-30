import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type AgentTrigger } from 'twenty-shared/application';
import { SettingsRow } from 'twenty-ui/components/settings';
import { themeCssVariables } from 'twenty-ui/theme';

import { TextArea } from '@/ui/input/components/TextArea';

const StyledContainer = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

type CoreAgentTriggerOptionsProps = {
  trigger: AgentTrigger;
  isReadOnly: boolean;
  onTriggerChange: (nextTrigger: AgentTrigger) => void;
};

export const CoreAgentTriggerOptions = ({
  trigger,
  isReadOnly,
  onTriggerChange,
}: CoreAgentTriggerOptionsProps) => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      <TextArea
        textAreaId={`core-agent-trigger-instructions-${trigger.id}`}
        label={t`Instructions`}
        placeholder={t`What should the agent do when this trigger fires?`}
        minRows={2}
        maxRows={6}
        value={trigger.instructions ?? ''}
        onChange={(instructions) =>
          onTriggerChange({
            ...trigger,
            instructions: isNonEmptyString(instructions.trim())
              ? instructions
              : null,
          })
        }
        disabled={isReadOnly}
      />
      <SettingsRow
        checked={trigger.isActive}
        onCheckedChange={(isActive) =>
          onTriggerChange({ ...trigger, isActive })
        }
        size="md"
        disabled={isReadOnly}
      >
        {t`Active`}
      </SettingsRow>
    </StyledContainer>
  );
};
