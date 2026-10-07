import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type AgentTrigger } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconClock, IconAddressBook, IconTrash } from 'twenty-ui/icon';
import { Checkbox, type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { WorkflowFieldsMultiSelect } from '@/workflow/components/WorkflowEditUpdateEventFieldsMultiSelect';
import { useObjectMetadataItemSelectOptions } from '@/object-metadata/hooks/useObjectMetadataItemSelectOptions';
import { describeCronExpression } from '~/utils/cron-to-human/describeCronExpression';

const StyledCard = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledActiveLabel = styled.label`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};

  > * {
    flex: 1;
  }
`;

const StyledHint = styled.div<{ isError: boolean }>`
  color: ${({ isError }) =>
    isError
      ? themeCssVariables.color.red
      : themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const toFieldNames = (fields: FieldMultiSelectValue | string): string[] => {
  if (Array.isArray(fields)) {
    return fields;
  }

  return isDefined(fields) ? [fields] : [];
};

type CoreAgentTriggerCardProps = {
  trigger: AgentTrigger;
  onChange: (trigger: AgentTrigger) => void;
  onDelete: () => void;
  disabled: boolean;
};

export const CoreAgentTriggerCard = ({
  trigger,
  onChange,
  onDelete,
  disabled,
}: CoreAgentTriggerCardProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const [objectNameSingular = '', action = 'created'] =
    trigger.type === 'DATABASE_EVENT'
      ? trigger.settings.eventName.split('.')
      : [];

  const objectOptions = useObjectMetadataItemSelectOptions({
    selectedObjectNameSingular: objectNameSingular,
  });

  const actionOptions: SelectOption<string>[] = [
    { label: t`Created`, value: 'created' },
    { label: t`Updated`, value: 'updated' },
    { label: t`Created or updated`, value: 'upserted' },
    { label: t`Deleted`, value: 'deleted' },
    { label: t`Permanently deleted`, value: 'destroyed' },
    { label: t`Restored`, value: 'restored' },
  ];

  const selectedObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectNameSingular,
  );

  const updateDatabaseEvent = ({
    nextObjectNameSingular = objectNameSingular,
    nextAction = action,
    updatedFields,
  }: {
    nextObjectNameSingular?: string;
    nextAction?: string;
    updatedFields?: string[];
  }) => {
    if (trigger.type !== 'DATABASE_EVENT') {
      return;
    }

    onChange({
      ...trigger,
      settings: {
        ...trigger.settings,
        eventName: `${nextObjectNameSingular}.${nextAction}`,
        updatedFields: nextAction === 'updated' ? updatedFields : undefined,
      },
    });
  };

  const handleWatchedFieldsChange = (
    fields: FieldMultiSelectValue | string,
  ) => {
    const updatedFields = toFieldNames(fields);

    updateDatabaseEvent({
      updatedFields: updatedFields.length > 0 ? updatedFields : undefined,
    });
  };

  const scheduleDescription = (() => {
    if (trigger.type !== 'CRON') {
      return null;
    }

    try {
      return {
        text: describeCronExpression(trigger.settings.pattern, {
          use24HourTimeFormat: true,
        }),
        isError: false,
      };
    } catch {
      return { text: t`This cron pattern is not valid`, isError: true };
    }
  })();

  const title =
    trigger.type === 'CRON' ? t`On a schedule` : t`When a record changes`;

  const TriggerIcon = trigger.type === 'CRON' ? IconClock : IconAddressBook;

  return (
    <StyledCard>
      <StyledHeader>
        <TriggerIcon size={theme.icon.size.md} />
        <StyledTitle>{title}</StyledTitle>
        <StyledActiveLabel>
          <Checkbox
            aria-label={t`Active`}
            checked={trigger.isActive}
            onCheckedChange={(isChecked) =>
              onChange({ ...trigger, isActive: isChecked })
            }
            disabled={disabled}
          />
          {t`Active`}
        </StyledActiveLabel>
        <LightIconButton
          emphasis="subtle"
          aria-label={t`Remove trigger`}
          onClick={onDelete}
          disabled={disabled}
        >
          <IconTrash />
        </LightIconButton>
      </StyledHeader>
      {trigger.type === 'DATABASE_EVENT' && (
        <>
          <StyledRow>
            <Select
              dropdownId={`agent-trigger-object-${trigger.id}`}
              label={t`Record type`}
              fullWidth
              disabled={disabled}
              value={objectNameSingular}
              options={objectOptions}
              onChange={(value) =>
                updateDatabaseEvent({ nextObjectNameSingular: value })
              }
              withSearchInput
              dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
            />
            <Select
              dropdownId={`agent-trigger-action-${trigger.id}`}
              label={t`Event`}
              fullWidth
              disabled={disabled}
              value={action}
              options={actionOptions}
              onChange={(value) => updateDatabaseEvent({ nextAction: value })}
            />
          </StyledRow>
          {action === 'updated' && isDefined(selectedObjectMetadataItem) && (
            <WorkflowFieldsMultiSelect
              key={objectNameSingular}
              label={t`Fields (optional)`}
              placeholder={t`Only run when one of these fields changes`}
              objectMetadataItem={selectedObjectMetadataItem}
              handleFieldsChange={handleWatchedFieldsChange}
              readonly={disabled}
              defaultFields={trigger.settings.updatedFields}
              actionType="DATABASE_EVENT"
            />
          )}
        </>
      )}
      {trigger.type === 'CRON' && (
        <div>
          <SettingsTextInput
            instanceId={`agent-trigger-cron-${trigger.id}`}
            label={t`Cron pattern`}
            placeholder="0 9 * * 1"
            value={trigger.settings.pattern}
            onChange={(pattern) =>
              onChange({ ...trigger, settings: { pattern } })
            }
            disabled={disabled}
            fullWidth
          />
          {isDefined(scheduleDescription) && (
            <StyledHint isError={scheduleDescription.isError}>
              {scheduleDescription.text}
            </StyledHint>
          )}
        </div>
      )}
      <TextArea
        textAreaId={`agent-trigger-instructions-${trigger.id}`}
        label={t`Instructions`}
        placeholder={t`What should the agent do when this trigger fires?`}
        minRows={2}
        maxRows={8}
        value={trigger.instructions ?? ''}
        onChange={(instructions) =>
          onChange({
            ...trigger,
            instructions: isNonEmptyString(instructions.trim())
              ? instructions
              : null,
          })
        }
        disabled={disabled}
      />
    </StyledCard>
  );
};
