import { resolveFormInstructions } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/resolveFormInstructions';

const CONTEXT = {
  trigger: { company: { name: 'Airbnb' } },
  'find-step': { first: { amount: 1200 } },
};

describe('resolveFormInstructions', () => {
  it('replaces variables with the values of the run', () => {
    expect(
      resolveFormInstructions({
        instructions:
          'Review the deal with {{trigger.company.name}} for {{find-step.first.amount}}.',
        context: CONTEXT,
      }),
    ).toBe('Review the deal with Airbnb for 1200.');
  });

  it('shows a lone variable holding an object as JSON', () => {
    expect(
      resolveFormInstructions({
        instructions: '{{trigger.company}}',
        context: CONTEXT,
      }),
    ).toBe('{"name":"Airbnb"}');
  });

  it('keeps a lone variable that does not resolve', () => {
    expect(
      resolveFormInstructions({
        instructions: '{{missing-step.value}}',
        context: CONTEXT,
      }),
    ).toBe('{{missing-step.value}}');
  });

  it('keeps a variable that does not resolve inside text', () => {
    expect(
      resolveFormInstructions({
        instructions: 'Read {{missing-step.name}} and confirm.',
        context: CONTEXT,
      }),
    ).toBe('Read {{missing-step.name}} and confirm.');
  });

  it('shows a variable holding null', () => {
    expect(
      resolveFormInstructions({
        instructions: 'Owner: {{trigger.owner}}',
        context: { trigger: { owner: null } },
      }),
    ).toBe('Owner: null');
  });

  it('shows nothing without instructions', () => {
    expect(
      resolveFormInstructions({ instructions: '  ', context: CONTEXT }),
    ).toBeUndefined();
    expect(
      resolveFormInstructions({ instructions: undefined, context: CONTEXT }),
    ).toBeUndefined();
  });
});
