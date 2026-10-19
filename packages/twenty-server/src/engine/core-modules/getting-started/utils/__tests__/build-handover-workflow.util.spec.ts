import { buildHandoverWorkflow } from 'src/engine/core-modules/getting-started/utils/build-handover-workflow.util';
import { evaluateStepFilters } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-step-filters.util';

const handoverWorkflow = buildHandoverWorkflow({
  connectedAccountId: 'account-id',
  companyIdFieldId: 'company-id-field',
  memberIdFieldId: 'member-id-field',
  opportunityStageFieldId: 'opportunity-stage-field',
});

describe('buildHandoverWorkflow', () => {
  it.each([
    { before: 'PROPOSAL', after: 'CUSTOMER', expected: true },
    { before: 'PROPOSAL', after: 'PROPOSAL', expected: false },
  ])(
    'triggers from $before to $after: $expected',
    ({ before, after, expected }) => {
      const { filter } = handoverWorkflow.trigger.settings;

      expect(
        evaluateStepFilters({
          stepFilterGroups: filter?.stepFilterGroups ?? [],
          stepFilters: filter?.stepFilters ?? [],
          context: {
            trigger: {
              properties: {
                before: { stage: before },
                after: { stage: after },
              },
            },
          },
        }),
      ).toBe(expected);
    },
  );
});
