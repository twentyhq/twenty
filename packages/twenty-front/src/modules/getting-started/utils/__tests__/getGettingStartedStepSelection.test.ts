import { getGettingStartedStepSelection } from '@/getting-started/utils/getGettingStartedStepSelection';
import { GettingStartedStep } from '~/generated-metadata/graphql';
import { mockGettingStartedSteps } from '~/testing/mock-data/gettingStartedSteps';

describe('getGettingStartedStepSelection', () => {
  it.each([
    {
      description: 'keeps the saved step and skips to the next remaining step',
      completedSteps: [GettingStartedStep.HANDOVER_DEALS],
      selectedStep: GettingStartedStep.INVITE_TEAM,
      expected: {
        selectedStep: GettingStartedStep.INVITE_TEAM,
        nextStep: GettingStartedStep.FOLLOW_UP_DEALS,
        stepAfterSkip: GettingStartedStep.FOLLOW_UP_DEALS,
      },
    },
    {
      description: 'wraps to the first remaining step',
      completedSteps: [],
      selectedStep: GettingStartedStep.FOLLOW_UP_DEALS,
      expected: {
        selectedStep: GettingStartedStep.FOLLOW_UP_DEALS,
        nextStep: GettingStartedStep.CONNECT_MAILBOX,
        stepAfterSkip: GettingStartedStep.CONNECT_MAILBOX,
      },
    },
    {
      description: 'selects the first step once every step is completed',
      completedSteps: mockGettingStartedSteps,
      selectedStep: null,
      expected: {
        selectedStep: GettingStartedStep.CONNECT_MAILBOX,
        nextStep: GettingStartedStep.CONNECT_MAILBOX,
        stepAfterSkip: GettingStartedStep.CONNECT_MAILBOX,
      },
    },
    {
      description: 'skips from a completed step back to the current step',
      completedSteps: [GettingStartedStep.INVITE_TEAM],
      selectedStep: GettingStartedStep.INVITE_TEAM,
      expected: {
        selectedStep: GettingStartedStep.INVITE_TEAM,
        nextStep: GettingStartedStep.HANDOVER_DEALS,
        stepAfterSkip: GettingStartedStep.CONNECT_MAILBOX,
      },
    },
  ])('$description', ({ completedSteps, selectedStep, expected }) => {
    expect(
      getGettingStartedStepSelection({
        steps: mockGettingStartedSteps,
        completedSteps,
        selectedStep,
      }),
    ).toEqual(expected);
  });
});
