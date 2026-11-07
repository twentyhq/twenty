import { ViewFilterOperand, type StepFilter } from 'twenty-shared/types';

import { CORE_AGENT_FILTER_FIELDS } from '@/object-core/agents/constants/CoreAgentFilterFields';
import { CORE_AGENTS_DEFAULT_FILTER_SETTINGS } from '@/object-core/agents/constants/CoreAgentsDefaultFilterSettings';
import { hasAppliedCoreObjectFilters } from '@/object-core/filters/utils/hasAppliedCoreObjectFilters';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

const [DEFAULT_SYSTEM_RULE] =
  CORE_AGENTS_DEFAULT_FILTER_SETTINGS.stepFilters ?? [];

const buildRule = (overrides: Partial<StepFilter>): StepFilter => ({
  id: 'rule',
  type: 'TEXT',
  stepOutputKey: 'NAME',
  operand: ViewFilterOperand.CONTAINS,
  value: 'lead',
  stepFilterGroupId: 'group',
  ...overrides,
});

const hasAppliedFilters = (filterSettings: FilterSettings) =>
  hasAppliedCoreObjectFilters({
    filterSettings,
    defaultFilterSettings: CORE_AGENTS_DEFAULT_FILTER_SETTINGS,
    filterFields: CORE_AGENT_FILTER_FIELDS,
  });

describe('hasAppliedCoreObjectFilters', () => {
  it('should not count the default filter as applied', () => {
    expect(hasAppliedFilters(CORE_AGENTS_DEFAULT_FILTER_SETTINGS)).toBe(false);
  });

  it('should ignore blank rules next to the default rule', () => {
    expect(
      hasAppliedFilters({
        stepFilters: [
          DEFAULT_SYSTEM_RULE,
          buildRule({ id: 'blank', type: 'unknown', stepOutputKey: '' }),
        ],
      }),
    ).toBe(false);
  });

  it('should ignore rule ids when the default rule is recreated', () => {
    expect(
      hasAppliedFilters({
        stepFilters: [{ ...DEFAULT_SYSTEM_RULE, id: 'recreated' }],
      }),
    ).toBe(false);
  });

  it('should not count settings without usable rules as applied', () => {
    expect(hasAppliedFilters({ stepFilters: [] })).toBe(false);
  });

  it('should count rules that change the query as applied', () => {
    expect(
      hasAppliedFilters({
        stepFilters: [DEFAULT_SYSTEM_RULE, buildRule({})],
      }),
    ).toBe(true);
    expect(
      hasAppliedFilters({
        stepFilters: [{ ...DEFAULT_SYSTEM_RULE, value: 'true' }],
      }),
    ).toBe(true);
  });
});
