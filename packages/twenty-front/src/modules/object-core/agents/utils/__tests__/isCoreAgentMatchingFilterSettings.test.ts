import {
  StepLogicalOperator,
  ViewFilterOperand,
  type StepFilter,
} from 'twenty-shared/types';

import { CORE_AGENTS_DEFAULT_FILTER_SETTINGS } from '@/object-core/agents/constants/CoreAgentsDefaultFilterSettings';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { isCoreAgentMatchingFilterSettings } from '@/object-core/agents/utils/isCoreAgentMatchingFilterSettings';

const buildAgent = (overrides: Partial<CoreAgent>): CoreAgent => ({
  id: 'agent-1',
  name: 'leadQualifier',
  label: 'Lead qualifier',
  prompt: 'Prompt',
  modelId: 'workspace-default-model',
  isCustom: true,
  isSystem: false,
  triggers: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const buildNameStepFilter = (overrides: Partial<StepFilter>): StepFilter => ({
  id: 'name-filter',
  type: 'TEXT',
  stepOutputKey: 'NAME',
  operand: ViewFilterOperand.CONTAINS,
  value: 'lead',
  stepFilterGroupId: 'group-1',
  ...overrides,
});

const userAgent = buildAgent({ label: 'Lead qualifier' });
const systemAgent = buildAgent({ label: 'Workflow agent', isSystem: true });

describe('isCoreAgentMatchingFilterSettings', () => {
  it('should leave system agents out with the default filter', () => {
    expect(
      isCoreAgentMatchingFilterSettings({
        agent: userAgent,
        filterSettings: CORE_AGENTS_DEFAULT_FILTER_SETTINGS,
      }),
    ).toBe(true);
    expect(
      isCoreAgentMatchingFilterSettings({
        agent: systemAgent,
        filterSettings: CORE_AGENTS_DEFAULT_FILTER_SETTINGS,
      }),
    ).toBe(false);
  });

  it('should match every agent when no rule is usable', () => {
    expect(
      isCoreAgentMatchingFilterSettings({
        agent: systemAgent,
        filterSettings: { stepFilters: [buildNameStepFilter({ value: '' })] },
      }),
    ).toBe(true);
  });

  it('should match names case and accent insensitively', () => {
    const filterSettings = {
      stepFilters: [buildNameStepFilter({ value: 'LÉAD' })],
    };

    expect(
      isCoreAgentMatchingFilterSettings({ agent: userAgent, filterSettings }),
    ).toBe(true);
    expect(
      isCoreAgentMatchingFilterSettings({ agent: systemAgent, filterSettings }),
    ).toBe(false);
  });

  it('should honor the root logical operator', () => {
    const [systemStepFilter] =
      CORE_AGENTS_DEFAULT_FILTER_SETTINGS.stepFilters ?? [];
    const stepFilters = [
      systemStepFilter,
      buildNameStepFilter({ value: 'workflow' }),
    ];

    expect(
      isCoreAgentMatchingFilterSettings({
        agent: systemAgent,
        filterSettings: {
          stepFilterGroups: [
            { id: 'group-1', logicalOperator: StepLogicalOperator.AND },
          ],
          stepFilters,
        },
      }),
    ).toBe(false);
    expect(
      isCoreAgentMatchingFilterSettings({
        agent: systemAgent,
        filterSettings: {
          stepFilterGroups: [
            { id: 'group-1', logicalOperator: StepLogicalOperator.OR },
          ],
          stepFilters,
        },
      }),
    ).toBe(true);
  });
});
