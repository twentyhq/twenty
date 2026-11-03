import { useCoreAgentField } from '@/object-core/agents/hooks/useCoreAgentField';
import { getCoreAgentEditableTrigger } from '@/object-core/agents/utils/getCoreAgentEditableTrigger';
import { isDefined } from 'twenty-shared/utils';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  AGENT_TRIGGER_LIMITS,
  type AgentTrigger,
} from 'twenty-shared/application';
import { Section } from 'twenty-ui/components/layout';
import { IconClock, IconAddressBook } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { CoreAgentTriggerCard } from '@/object-core/agents/components/CoreAgentTriggerCard';
import { buildDefaultCoreAgentTrigger } from '@/object-core/agents/utils/buildDefaultCoreAgentTrigger';
import { useObjectMetadataItemSelectOptions } from '@/object-metadata/hooks/useObjectMetadataItemSelectOptions';

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
  disabled: boolean;
};

export const CoreAgentTriggersTab = ({
  disabled,
}: CoreAgentTriggersTabProps) => {
  const { t } = useLingui();
  const { value: rawTriggers = [], setValue: setTriggers } = useCoreAgentField({
    field: 'triggers',
  });
  const triggers = rawTriggers
    .map(getCoreAgentEditableTrigger)
    .filter(isDefined);
  const objectOptions = useObjectMetadataItemSelectOptions();

  const defaultObjectNameSingular =
    objectOptions.find((option) => option.value === 'company')?.value ??
    objectOptions[0]?.value ??
    'company';

  const canAddTrigger =
    !disabled &&
    rawTriggers.length < AGENT_TRIGGER_LIMITS.MAX_TRIGGERS_PER_AGENT;

  const addTrigger = (type: AgentTrigger['type']) =>
    setTriggers((previous) => [
      ...previous,
      buildDefaultCoreAgentTrigger({
        type,
        objectNameSingular: defaultObjectNameSingular,
      }),
    ]);

  const updateTrigger = (updatedTrigger: AgentTrigger) =>
    setTriggers((previous) =>
      previous.map((rawTrigger) => {
        const trigger = getCoreAgentEditableTrigger(rawTrigger);
        return trigger?.id === updatedTrigger.id ? updatedTrigger : rawTrigger;
      }),
    );

  const deleteTrigger = (triggerId: string) =>
    setTriggers((previous) =>
      previous.filter(
        (rawTrigger) =>
          getCoreAgentEditableTrigger(rawTrigger)?.id !== triggerId,
      ),
    );

  return (
    <Section.Root>
      <Section.Header
        title={t`Triggers`}
        description={t`Run this agent on its own when records change or on a schedule. It runs with its role's permissions.`}
      />
      <StyledTriggerList>
        {rawTriggers.length > triggers.length && (
          <StyledEmptyMessage>{t`Some saved triggers are unsupported. They will be preserved.`}</StyledEmptyMessage>
        )}
        {rawTriggers.length === 0 && (
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
