import { StepStatus } from 'twenty-shared/workflow';

import { resolveFormInstructions } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/resolveFormInstructions';

const STEP_INFOS = {
  trigger: {
    status: StepStatus.SUCCESS,
    result: { company: { name: 'Airbnb' } },
  },
  'find-step': {
    status: StepStatus.SUCCESS,
    result: { first: { amount: 1200 } },
  },
};

describe('resolveFormInstructions', () => {
  it('replaces variables with the values of the run', () => {
    expect(
      resolveFormInstructions({
        instructions:
          'Review the deal with {{trigger.company.name}} for {{find-step.first.amount}}.',
        stepInfos: STEP_INFOS,
      }),
    ).toBe('Review the deal with Airbnb for 1200.');
  });

  it('shows a lone variable holding an object as JSON', () => {
    expect(
      resolveFormInstructions({
        instructions: '{{trigger.company}}',
        stepInfos: STEP_INFOS,
      }),
    ).toBe('{"name":"Airbnb"}');
  });

  it('shows nothing without instructions', () => {
    expect(
      resolveFormInstructions({ instructions: '  ', stepInfos: STEP_INFOS }),
    ).toBeUndefined();
    expect(
      resolveFormInstructions({
        instructions: undefined,
        stepInfos: undefined,
      }),
    ).toBeUndefined();
  });
});
