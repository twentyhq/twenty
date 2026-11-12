import { getGettingStartedAdjacentSteps } from '@/getting-started/utils/getGettingStartedAdjacentSteps';
import { getGettingStartedStackedSteps } from '@/getting-started/utils/getGettingStartedStackedSteps';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';
import {
  mockGettingStartedStepActionKeys,
  mockGettingStartedStepDefinitions,
} from '~/testing/mock-data/gettingStartedSteps';

describe('getGettingStartedAdjacentSteps', () => {
  it.each([
    {
      description: 'follows the rail',
      steps: mockGettingStartedStepDefinitions,
      selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
      expected: {
        previousStepActionKey: GettingStartedStepActionKey.INSTALL_APP,
        nextStepActionKey: GettingStartedStepActionKey.HANDOVER_DEALS,
      },
    },
    {
      description: 'wraps around the ends',
      steps: mockGettingStartedStepDefinitions,
      selectedStepActionKey: GettingStartedStepActionKey.CONNECT_MAILBOX,
      expected: {
        previousStepActionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        nextStepActionKey: GettingStartedStepActionKey.IMPORT_DATA,
      },
    },
    {
      description: 'has no adjacent step with a single step',
      steps: mockGettingStartedStepDefinitions.slice(0, 1),
      selectedStepActionKey: GettingStartedStepActionKey.CONNECT_MAILBOX,
      expected: {
        previousStepActionKey: undefined,
        nextStepActionKey: undefined,
      },
    },
  ])('$description', ({ steps, selectedStepActionKey, expected }) => {
    expect(
      getGettingStartedAdjacentSteps({ steps, selectedStepActionKey }),
    ).toEqual(expected);
  });

  it.each(mockGettingStartedStepActionKeys)(
    'goes down to the front card of the stack from %s',
    (selectedStepActionKey) => {
      const [frontStackedStep] = getGettingStartedStackedSteps({
        steps: mockGettingStartedStepDefinitions,
        selectedStepActionKey,
      });

      expect(
        getGettingStartedAdjacentSteps({
          steps: mockGettingStartedStepDefinitions,
          selectedStepActionKey,
        }).nextStepActionKey,
      ).toBe(frontStackedStep.actionKey);
    },
  );

  it.each(mockGettingStartedStepActionKeys)(
    'goes back up to %s after going down',
    (selectedStepActionKey) => {
      const { nextStepActionKey } = getGettingStartedAdjacentSteps({
        steps: mockGettingStartedStepDefinitions,
        selectedStepActionKey,
      });

      expect(
        getGettingStartedAdjacentSteps({
          steps: mockGettingStartedStepDefinitions,
          selectedStepActionKey: nextStepActionKey ?? selectedStepActionKey,
        }).previousStepActionKey,
      ).toBe(selectedStepActionKey);
    },
  );
});
