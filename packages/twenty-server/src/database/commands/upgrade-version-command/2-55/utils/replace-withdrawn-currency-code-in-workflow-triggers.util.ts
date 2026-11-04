import { type MappedValue } from 'src/database/commands/upgrade-version-command/2-55/types/mapped-value.type';
import { replaceWithdrawnCurrencyCodeInWorkflowTrigger } from 'src/database/commands/upgrade-version-command/2-55/utils/replace-withdrawn-currency-code-in-workflow-trigger.util';
import { toMappedValue } from 'src/database/commands/upgrade-version-command/2-55/utils/to-mapped-value.util';

export const replaceWithdrawnCurrencyCodeInWorkflowTriggers = ({
  triggers,
  currencyFieldMetadataIds,
}: {
  triggers: unknown;
  currencyFieldMetadataIds: Set<string>;
}): MappedValue => {
  if (!Array.isArray(triggers)) {
    return { value: triggers, hasChanged: false };
  }

  return toMappedValue({
    original: triggers,
    mapped: triggers.map(
      (trigger) =>
        replaceWithdrawnCurrencyCodeInWorkflowTrigger({
          trigger,
          currencyFieldMetadataIds,
        }).value,
    ),
  });
};
