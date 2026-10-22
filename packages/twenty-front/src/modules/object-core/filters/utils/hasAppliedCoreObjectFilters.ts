import { type CoreObjectFilterField } from '@/object-core/filters/types/CoreObjectFilterField';
import { isUsableCoreObjectFilterRule } from '@/object-core/filters/utils/isUsableCoreObjectFilterRule';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

// Compared by meaning: ids and blank rules do not change the query
const getUsableRuleSignatures = ({
  filterSettings,
  filterFields,
}: {
  filterSettings: FilterSettings;
  filterFields: CoreObjectFilterField[];
}): string[] =>
  (filterSettings.stepFilters ?? [])
    .filter((stepFilter) =>
      isUsableCoreObjectFilterRule({ stepFilter, filterFields }),
    )
    .map(({ stepOutputKey, operand, value }) =>
      JSON.stringify([stepOutputKey, operand, value]),
    )
    .sort();

export const hasAppliedCoreObjectFilters = ({
  filterSettings,
  defaultFilterSettings,
  filterFields,
}: {
  filterSettings: FilterSettings;
  defaultFilterSettings: FilterSettings;
  filterFields: CoreObjectFilterField[];
}): boolean => {
  const usableRuleSignatures = getUsableRuleSignatures({
    filterSettings,
    filterFields,
  });
  const defaultRuleSignatures = getUsableRuleSignatures({
    filterSettings: defaultFilterSettings,
    filterFields,
  });

  return (
    usableRuleSignatures.length > 0 &&
    usableRuleSignatures.join('\n') !== defaultRuleSignatures.join('\n')
  );
};
