import { GettingStartedStepKind } from 'src/engine/core-modules/getting-started/enums/getting-started-step-kind.enum';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { buildGettingStartedStepDefinition } from 'src/engine/core-modules/getting-started/utils/build-getting-started-step-definition.util';

const translate = (descriptor: { message?: string }) =>
  descriptor.message ?? '';

describe('buildGettingStartedStepDefinition', () => {
  it('should define a step with a workflow template as a workflow step', () => {
    expect(
      buildGettingStartedStepDefinition({
        step: GettingStartedStep.HANDOVER_DEALS,
        translate,
      }),
    ).toEqual({
      step: GettingStartedStep.HANDOVER_DEALS,
      kind: GettingStartedStepKind.WORKFLOW,
      title: 'Hand over won deals',
      doneTitle: 'Workflow enabled',
      description: 'Start the handover when a deal is won.',
      icon: 'IconSettingsAutomation',
      iconColor: 'gray',
      promptLabel: null,
      prompt: null,
    });
  });

  it('should define a step with a prompt as a prompt step', () => {
    expect(
      buildGettingStartedStepDefinition({
        step: GettingStartedStep.FOLLOW_UP_DEALS,
        translate,
      }),
    ).toMatchObject({
      kind: GettingStartedStepKind.PROMPT,
      promptLabel: 'Follow-up instructions',
      prompt:
        'Every Monday, draft a follow-up email for each deal closing in the next 30 days.',
    });
  });

  it('should define any other step as a custom step', () => {
    expect(
      buildGettingStartedStepDefinition({
        step: GettingStartedStep.CONNECT_MAILBOX,
        translate,
      }),
    ).toMatchObject({
      kind: GettingStartedStepKind.CUSTOM,
      prompt: null,
    });
  });
});
