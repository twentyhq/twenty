import { type StepFilter } from 'twenty-shared/types';

import { CORE_AGENT_FILTER_FIELDS } from '@/object-core/agents/constants/CoreAgentFilterFields';
import { isUsableCoreObjectFilterRule } from '@/object-core/filters/utils/isUsableCoreObjectFilterRule';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export const getUsableCoreAgentStepFilters = (
  filterSettings: Pick<FilterSettings, 'stepFilters'>,
): StepFilter[] =>
  (filterSettings.stepFilters ?? []).filter((stepFilter) =>
    isUsableCoreObjectFilterRule({
      stepFilter,
      filterFields: CORE_AGENT_FILTER_FIELDS,
    }),
  );
