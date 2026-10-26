import { getNextGettingStartedStep } from '@/getting-started/utils/getNextGettingStartedStep';
import { GettingStartedStep } from '~/generated-metadata/graphql';
import { mockGettingStartedSteps } from '~/testing/mock-data/gettingStartedSteps';

describe('getNextGettingStartedStep', () => {
  it.each([
    {
      description: 'skips completed steps after the selected step',
      selectedStep: GettingStartedStep.CONNECT_MAILBOX,
      completedSteps: [GettingStartedStep.IMPORT_DATA],
      expectedStep: GettingStartedStep.INSTALL_APP,
    },
    {
      description: 'wraps to the first remaining step',
      selectedStep: GettingStartedStep.FOLLOW_UP_DEALS,
      completedSteps: [],
      expectedStep: GettingStartedStep.CONNECT_MAILBOX,
    },
  ])('$description', ({ selectedStep, completedSteps, expectedStep }) => {
    expect(
      getNextGettingStartedStep({
        steps: mockGettingStartedSteps.map(({ key }) => key),
        selectedStep,
        completedSteps,
      }),
    ).toBe(expectedStep);
  });
});
