import { useCoreAgentField } from '@/object-core/agents/hooks/useCoreAgentField';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useOpenCoreAgentTrigger } from '@/object-core/agents/hooks/useOpenCoreAgentTrigger';
import { buildDefaultCoreAgentTrigger } from '@/object-core/agents/utils/buildDefaultCoreAgentTrigger';
import { getCoreAgentTriggerSummary } from '@/object-core/agents/utils/getCoreAgentTriggerSummary';
import { getCoreAgentEditableTrigger } from '@/object-core/agents/utils/getCoreAgentEditableTrigger';
import { useObjectMetadataItemSelectOptions } from '@/object-metadata/hooks/useObjectMetadataItemSelectOptions';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  AGENT_TRIGGER_LIMITS,
  type AgentTrigger,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import {
  IconClock,
  IconAddressBook,
  IconPencil,
  IconTrash,
  IconAlertTriangle,
  IconPlus,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';

type CoreAgentTriggersTabProps = { disabled: boolean; agentId?: string };

export const CoreAgentTriggersTab = ({
  disabled,
  agentId,
}: CoreAgentTriggersTabProps) => {
  const { t } = useLingui();
  const dropdownId = useId();
  const { value, setValue } = useCoreAgentField({ field: 'triggers', agentId });
  const { session } = useCoreAgentEditStatus({ agentId });
  const { openCoreAgentTrigger } = useOpenCoreAgentTrigger();
  const objectOptions = useObjectMetadataItemSelectOptions();
  const triggers = value ?? [];
  const defaultObjectNameSingular =
    objectOptions.find((option) => option.value === 'company')?.value ??
    objectOptions[0]?.value ??
    'company';
  const canAddTrigger =
    !disabled && triggers.length < AGENT_TRIGGER_LIMITS.MAX_TRIGGERS_PER_AGENT;

  const addTrigger = (type: AgentTrigger['type']) => {
    if (!canAddTrigger || !isDefined(session)) {
      return;
    }

    const trigger = buildDefaultCoreAgentTrigger({
      type,
      objectNameSingular: defaultObjectNameSingular,
    });
    setValue((current) =>
      current.length < AGENT_TRIGGER_LIMITS.MAX_TRIGGERS_PER_AGENT
        ? [...current, trigger]
        : current,
    );
    openCoreAgentTrigger({ agentId: session.agent.id, triggerId: trigger.id });
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Triggers`}
        description={t`Run this agent when records change or on a schedule. It runs with its role's permissions.`}
      />
      {triggers.length === 0 && (
        <Text color="tertiary">{t`This agent can still run from chat, workflows, and the API.`}</Text>
      )}
      {triggers.map((rawTrigger, index) => {
        const trigger = getCoreAgentEditableTrigger(rawTrigger);
        const isSupported = isDefined(trigger);
        const title = !isSupported
          ? t`Unsupported trigger`
          : trigger.type === 'CRON'
            ? t`On a schedule`
            : t`When a record changes`;
        const TriggerIcon = !isSupported
          ? IconAlertTriangle
          : trigger.type === 'CRON'
            ? IconClock
            : IconAddressBook;
        const objectLabel =
          trigger?.type === 'DATABASE_EVENT'
            ? objectOptions.find(
                (option) =>
                  option.value === trigger.settings.eventName.split('.')[0],
              )?.label
            : undefined;
        const description = isSupported
          ? getCoreAgentTriggerSummary({ trigger, objectLabel })
          : t`Preserved by this version. Remove it to stop using it.`;

        return (
          <ListItem
            key={trigger?.id ?? `unsupported-${index}`}
            startIcon={<TriggerIcon />}
            description={description}
            descriptionPlacement="below"
            actionsVisibility="always"
            actions={
              <>
                {isSupported && isDefined(session) && (
                  <LightIconButton
                    aria-label={t`Edit trigger ${index + 1}`}
                    onClick={() =>
                      openCoreAgentTrigger({
                        agentId: session.agent.id,
                        triggerId: trigger.id,
                      })
                    }
                  >
                    <IconPencil />
                  </LightIconButton>
                )}
                <LightIconButton
                  aria-label={t`Remove trigger ${index + 1}`}
                  disabled={disabled}
                  onClick={() =>
                    setValue((current) =>
                      current[index] === rawTrigger
                        ? current.filter(
                            (_, currentIndex) => currentIndex !== index,
                          )
                        : current,
                    )
                  }
                >
                  <IconTrash />
                </LightIconButton>
              </>
            }
          >
            {title}
          </ListItem>
        );
      })}
      <DropdownRoot dropdownId={dropdownId} type="menu">
        <Dropdown.Trigger
          render={
            <Button
              startIcon={<IconPlus />}
              size="sm"
              variant="outline"
              disabled={!canAddTrigger}
            >{t`Add trigger`}</Button>
          }
        />
        <DropdownContent aria-label={t`Trigger event`}>
          <Dropdown.Section>
            <Dropdown.ActionItem
              startIcon={<IconAddressBook />}
              disabled={!canAddTrigger}
              onClick={() => addTrigger('DATABASE_EVENT')}
            >{t`When a record changes`}</Dropdown.ActionItem>
            <Dropdown.ActionItem
              startIcon={<IconClock />}
              disabled={!canAddTrigger}
              onClick={() => addTrigger('CRON')}
            >{t`On a schedule`}</Dropdown.ActionItem>
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
    </Section.Root>
  );
};
