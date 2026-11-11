import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import {
  computeDatabaseEventTriggerConditionFromFilter,
  TRIGGER_STEP_ID,
} from 'twenty-shared/workflow';
import { SegmentedControl } from 'twenty-ui/components/input';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { RecordEventConditionEditor } from '@/validation-rules/components/RecordEventConditionEditor';
import { useValidationRuleFields } from '@/validation-rules/hooks/useValidationRuleFields';
import { type WorkflowDatabaseEventTrigger } from '@/workflow/types/Workflow';
import { WorkflowStepFilterBuilder } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterBuilder';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

type ConditionMode = 'FILTERS' | 'EXPRESSION';

type WorkflowDatabaseEventTriggerConditionInputProps = {
  trigger: WorkflowDatabaseEventTrigger;
  objectMetadataItem: EnrichedObjectMetadataItem;
  readonly: boolean;
  onTriggerUpdate: (trigger: WorkflowDatabaseEventTrigger) => void;
};

export const WorkflowDatabaseEventTriggerConditionInput = ({
  trigger,
  objectMetadataItem,
  readonly,
  onTriggerUpdate,
}: WorkflowDatabaseEventTriggerConditionInputProps) => {
  const { t } = useLingui();
  const { fields } = useValidationRuleFields({ objectMetadataItem });
  const { eventName, filter, condition } = trigger.settings;

  const computeConditionFromFilter = (
    nextFilter: WorkflowDatabaseEventTrigger['settings']['filter'],
  ) =>
    computeDatabaseEventTriggerConditionFromFilter({
      eventName,
      filter: nextFilter,
      fields,
    });

  // A condition the rows don't produce was written as an expression
  const [mode, setMode] = useState<ConditionMode>(
    isNonEmptyString(condition) &&
      condition !== computeConditionFromFilter(filter)
      ? 'EXPRESSION'
      : 'FILTERS',
  );

  const handleModeChange = (nextMode: ConditionMode) => {
    setMode(nextMode);

    if (readonly) {
      return;
    }

    onTriggerUpdate({
      ...trigger,
      settings: {
        ...trigger.settings,
        condition:
          nextMode === 'EXPRESSION'
            ? (computeConditionFromFilter(filter) ?? '')
            : computeConditionFromFilter(filter),
      },
    });
  };

  const handleFilterSettingsUpdate = (filterSettings: FilterSettings) => {
    const nextFilter = {
      stepFilterGroups: filterSettings.stepFilterGroups ?? [],
      stepFilters: filterSettings.stepFilters ?? [],
    };

    onTriggerUpdate({
      ...trigger,
      settings: {
        ...trigger.settings,
        filter: nextFilter,
        condition: computeConditionFromFilter(nextFilter),
      },
    });
  };

  // Rows can't hold a free expression, so editing one drops them
  const handleConditionChange = (nextCondition: string) => {
    onTriggerUpdate({
      ...trigger,
      settings: {
        ...trigger.settings,
        filter: undefined,
        condition: nextCondition,
      },
    });
  };

  return (
    <>
      {!readonly && (
        <SegmentedControl
          aria-label={t`Condition editor`}
          value={mode}
          onValueChange={handleModeChange}
          options={[
            { value: 'FILTERS', label: t`Filters` },
            { value: 'EXPRESSION', label: t`Expression` },
          ]}
        />
      )}
      {mode === 'FILTERS' ? (
        <WorkflowStepFilterBuilder
          instanceId={TRIGGER_STEP_ID}
          defaultValue={filter ?? { stepFilterGroups: [], stepFilters: [] }}
          readonly={readonly}
          onFilterSettingsUpdate={handleFilterSettingsUpdate}
        />
      ) : (
        <div>
          <InputLabel>{t`Conditions`}</InputLabel>
          <RecordEventConditionEditor
            objectMetadataItem={objectMetadataItem}
            condition={condition ?? ''}
            onConditionChange={handleConditionChange}
            isReadOnly={readonly}
          />
        </div>
      )}
    </>
  );
};
