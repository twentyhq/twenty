import {
  validateWorkflowStructure,
  WorkflowActionType,
} from 'twenty-shared/workflow';
import { buildHandoverWorkflow } from 'src/engine/core-modules/getting-started/utils/build-handover-workflow.util';
import { assembleWorkflowVersionContent } from 'src/modules/workflow/workflow-builder/utils/assemble-workflow-version-content.util';
import { evaluateStepFilters } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-step-filters.util';

const template = buildHandoverWorkflow({
  connectedAccountId: 'account-id',
  companyIdFieldId: 'company-id-field',
  memberIdFieldId: 'member-id-field',
});

describe('Getting started handover', () => {
  it('builds a connected, valid workflow with a kickoff task and an owner email', () => {
    const content = assembleWorkflowVersionContent(template);
    expect(
      validateWorkflowStructure({
        trigger: content.trigger,
        steps: content.steps ?? [],
      }).errors,
    ).toEqual([]);
    expect(
      content.steps?.find(
        (step) => step.type === WorkflowActionType.CREATE_RECORD,
      )?.settings.input,
    ).toEqual(
      expect.objectContaining({
        objectName: 'task',
        objectRecord: expect.objectContaining({
          title: expect.stringContaining('trigger.properties.after.name'),
        }),
      }),
    );
    expect(
      content.steps?.find((step) => step.type === WorkflowActionType.SEND_EMAIL)
        ?.settings.input,
    ).toEqual(
      expect.objectContaining({
        connectedAccountId: 'account-id',
        recipients: { to: expect.stringContaining('.first.userEmail') },
      }),
    );
  });
  it.each([
    ['PROPOSAL', 'CUSTOMER', true],
    ['CUSTOMER', 'CUSTOMER', false],
    ['PROPOSAL', 'PROPOSAL', false],
    ['CUSTOMER', 'LOST', false],
  ])(
    'runs only when stage changes from %s to %s',
    (before, after, expected) => {
      const filter = template.steps.find(
        (step) => step.type === WorkflowActionType.FILTER,
      );
      if (filter?.type !== WorkflowActionType.FILTER)
        throw new Error('Missing filter');
      expect(
        evaluateStepFilters({
          stepFilterGroups: filter.settings.input.stepFilterGroups ?? [],
          stepFilters: filter.settings.input.stepFilters ?? [],
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
