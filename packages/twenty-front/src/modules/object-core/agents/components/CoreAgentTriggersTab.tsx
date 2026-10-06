import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  AGENT_TRIGGER_LIMITS,
  type AgentTrigger,
} from 'twenty-shared/application';
import { Section } from 'twenty-ui/components';
import { IconClock, IconAddressBook } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { CoreAgentTriggerCard } from '@/object-core/agents/components/CoreAgentTriggerCard';
import { buildDefaultCoreAgentTrigger } from '@/object-core/agents/utils/buildDefaultCoreAgentTrigger';
import { useWorkflowObjectSelectOptions } from '@/workflow/hooks/useWorkflowObjectSelectOptions';

const StyledTriggerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledEmptyMessage = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

type CoreAgentTriggersTabProps = {
  triggers: AgentTrigger[];
  onTriggersChange: (triggers: AgentTrigger[]) => void;
  disabled: boolean;
};

export const CoreAgentTriggersTab = ({
  triggers,
  onTriggersChange,
  disabled,
}: CoreAgentTriggersTabProps) => {
  const { t } = useLingui();
  const objectOptions = useWorkflowObjectSelectOptions();

  const defaultObjectNameSingular =
    objectOptions.find((option) => option.value === 'company')?.value ??
    objectOptions[0]?.value ??
    'company';

  const canAddTrigger =
    !disabled && triggers.length < AGENT_TRIGGER_LIMITS.MAX_TRIGGERS_PER_AGENT;

  const addTrigger = (type: AgentTrigger['type']) =>
    onTriggersChange([
      ...triggers,
      buildDefaultCoreAgentTrigger({
        type,
        objectNameSingular: defaultObjectNameSingular,
      }),
    ]);

  const updateTrigger = (updatedTrigger: AgentTrigger) =>
    onTriggersChange(
      triggers.map((trigger) =>
        trigger.id === updatedTrigger.id ? updatedTrigger : trigger,
      ),
    );

  const deleteTrigger = (triggerId: string) =>
    onTriggersChange(triggers.filter((trigger) => trigger.id !== triggerId));

  return (
    <Section.Root>
      <Section.Header
        title={t`Triggers`}
        description={t`Run this agent on its own when records change or on a schedule. It runs with its role's permissions.`}
      />
      <StyledTriggerList>
        {triggers.length === 0 && (
          <StyledEmptyMessage>
            {t`This agent only runs when someone sends it a message.`}
          </StyledEmptyMessage>
        )}
        {triggers.map((trigger) => (
          <CoreAgentTriggerCard
            key={trigger.id}
            trigger={trigger}
            onChange={updateTrigger}
            onDelete={() => deleteTrigger(trigger.id)}
            disabled={disabled}
          />
        ))}
      </StyledTriggerList>
      {canAddTrigger && (
        <StyledActions>
          <Button
            startIcon={<IconAddressBook />}
            size="sm"
            variant="outline"
            onClick={() => addTrigger('DATABASE_EVENT')}
          >{t`Add record trigger`}</Button>
          <Button
            startIcon={<IconClock />}
            size="sm"
            variant="outline"
            onClick={() => addTrigger('CRON')}
          >{t`Add schedule`}</Button>
        </StyledActions>
      )}
    </Section.Root>
  );
};
