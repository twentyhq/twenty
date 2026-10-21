import { type CoreObjectFilterField } from '@/object-core/filters/types/CoreObjectFilterField';
import { isUsableCoreObjectFilterRule } from '@/object-core/filters/utils/isUsableCoreObjectFilterRule';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const hasAppliedCoreObjectFilters = ({
  filterSettings,
  defaultFilterSettings,
  filterFields,
}: {
  filterSettings: FilterSettings;
  defaultFilterSettings: FilterSettings;
  filterFields: CoreObjectFilterField[];
}): boolean =>
  !isDeeplyEqual(filterSettings, defaultFilterSettings) &&
  (filterSettings.stepFilters ?? []).some((stepFilter) =>
    isUsableCoreObjectFilterRule({ stepFilter, filterFields }),
  );
