import { isPlainObject } from 'twenty-shared/utils';

import { type MappedValue } from 'src/database/commands/upgrade-version-command/2-56/types/mapped-value.type';
import { replaceWithdrawnCurrencyCodeInStepFilters } from 'src/database/commands/upgrade-version-command/2-56/utils/replace-withdrawn-currency-code-in-step-filters.util';
import { toMappedValue } from 'src/database/commands/upgrade-version-command/2-56/utils/to-mapped-value.util';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const replaceWithdrawnCurrencyCodeInWorkflowTrigger = ({
  trigger,
  currencyFieldMetadataIds,
}: {
  trigger: unknown;
  currencyFieldMetadataIds: Set<string>;
}): MappedValue => {
  if (
    !isPlainObject(trigger) ||
    trigger.type !== WorkflowTriggerType.DATABASE_EVENT ||
    !isPlainObject(trigger.settings) ||
    !isPlainObject(trigger.settings.filter)
  ) {
    return { value: trigger, hasChanged: false };
  }

  return toMappedValue({
    original: trigger,
    mapped: {
      ...trigger,
      settings: {
        ...trigger.settings,
        filter: {
          ...trigger.settings.filter,
          stepFilters: replaceWithdrawnCurrencyCodeInStepFilters({
            stepFilters: trigger.settings.filter.stepFilters,
            currencyFieldMetadataIds,
          }),
        },
      },
    },
  });
};
