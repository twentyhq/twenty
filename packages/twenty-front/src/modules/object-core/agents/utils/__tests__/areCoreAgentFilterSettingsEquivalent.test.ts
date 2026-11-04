import {
  StepLogicalOperator,
  ViewFilterOperand,
  type StepFilter,
} from 'twenty-shared/types';

import { areCoreAgentFilterSettingsEquivalent } from '@/object-core/agents/utils/areCoreAgentFilterSettingsEquivalent';

const ROOT_STEP_FILTER_GROUP_ID = 'root-step-filter-group';

const NAME_RULE: StepFilter = {
  id: 'name-rule',
  type: 'TEXT',
  stepOutputKey: 'NAME',
  operand: ViewFilterOperand.CONTAINS,
  value: 'lead',
  stepFilterGroupId: ROOT_STEP_FILTER_GROUP_ID,
};

const SYSTEM_RULE: StepFilter = {
  id: 'system-rule',
  type: 'BOOLEAN',
  stepOutputKey: 'IS_SYSTEM',
  operand: ViewFilterOperand.IS,
  value: 'false',
  stepFilterGroupId: ROOT_STEP_FILTER_GROUP_ID,
};

describe('areCoreAgentFilterSettingsEquivalent', () => {
  it('ignores rule order and treats a missing operator as AND', () => {
    expect(
      areCoreAgentFilterSettingsEquivalent({
        filterSettings: {
          stepFilterGroups: [
            {
              id: ROOT_STEP_FILTER_GROUP_ID,
              logicalOperator: StepLogicalOperator.AND,
            },
          ],
          stepFilters: [NAME_RULE, SYSTEM_RULE],
        },
        otherFilterSettings: { stepFilters: [SYSTEM_RULE, NAME_RULE] },
      }),
    ).toBe(true);
  });

  it('distinguishes matching any rule from matching all rules', () => {
    expect(
      areCoreAgentFilterSettingsEquivalent({
        filterSettings: {
          stepFilterGroups: [
            {
              id: ROOT_STEP_FILTER_GROUP_ID,
              logicalOperator: StepLogicalOperator.OR,
            },
          ],
          stepFilters: [NAME_RULE, SYSTEM_RULE],
        },
        otherFilterSettings: { stepFilters: [NAME_RULE, SYSTEM_RULE] },
      }),
    ).toBe(false);
  });
});
