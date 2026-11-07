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
      description: 'follows the rail when no step is done',
      steps: mockGettingStartedStepDefinitions,
      completedStepActionKeys: [],
      selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
      expected: {
        previousStepActionKey: GettingStartedStepActionKey.INSTALL_APP,
        nextStepActionKey: GettingStartedStepActionKey.HANDOVER_DEALS,
      },
    },
    {
      description: 'skips done steps in both directions',
      steps: mockGettingStartedStepDefinitions,
      completedStepActionKeys: [
        GettingStartedStepActionKey.INSTALL_APP,
        GettingStartedStepActionKey.HANDOVER_DEALS,
      ],
      selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
      expected: {
        previousStepActionKey: GettingStartedStepActionKey.IMPORT_DATA,
        nextStepActionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
      },
    },
    {
      description: 'goes from a done step to the first remaining step',
      steps: mockGettingStartedStepDefinitions,
      completedStepActionKeys: [
        GettingStartedStepActionKey.CONNECT_MAILBOX,
        GettingStartedStepActionKey.INVITE_TEAM,
      ],
      selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
      expected: {
        previousStepActionKey: GettingStartedStepActionKey.INSTALL_APP,
        nextStepActionKey: GettingStartedStepActionKey.IMPORT_DATA,
      },
    },
    {
      description: 'wraps around the ends',
      steps: mockGettingStartedStepDefinitions,
      completedStepActionKeys: [],
      selectedStepActionKey: GettingStartedStepActionKey.CONNECT_MAILBOX,
      expected: {
        previousStepActionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        nextStepActionKey: GettingStartedStepActionKey.IMPORT_DATA,
      },
    },
    {
      description: 'follows the rail once every step is done',
      steps: mockGettingStartedStepDefinitions,
      completedStepActionKeys: mockGettingStartedStepActionKeys,
      selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
      expected: {
        previousStepActionKey: GettingStartedStepActionKey.INSTALL_APP,
        nextStepActionKey: GettingStartedStepActionKey.HANDOVER_DEALS,
      },
    },
    {
      description: 'has no adjacent step with a single step',
      steps: mockGettingStartedStepDefinitions.slice(0, 1),
      completedStepActionKeys: [],
      selectedStepActionKey: GettingStartedStepActionKey.CONNECT_MAILBOX,
      expected: {
        previousStepActionKey: undefined,
        nextStepActionKey: undefined,
      },
    },
  ])(
    '$description',
    ({ steps, completedStepActionKeys, selectedStepActionKey, expected }) => {
      expect(
        getGettingStartedAdjacentSteps({
          steps,
          completedStepActionKeys,
          selectedStepActionKey,
        }),
      ).toEqual(expected);
    },
  );

  it.each(mockGettingStartedStepActionKeys)(
    'goes down to the front card of the stack from %s',
    (selectedStepActionKey) => {
      const completedStepActionKeys = [
        GettingStartedStepActionKey.CONNECT_MAILBOX,
        GettingStartedStepActionKey.HANDOVER_DEALS,
      ];

      const [frontStackedStep] = getGettingStartedStackedSteps({
        steps: mockGettingStartedStepDefinitions,
        completedStepActionKeys,
        selectedStepActionKey,
      });

      expect(
        getGettingStartedAdjacentSteps({
          steps: mockGettingStartedStepDefinitions,
          completedStepActionKeys,
          selectedStepActionKey,
        }).nextStepActionKey,
      ).toBe(frontStackedStep.actionKey);
    },
  );

  it.each([
    GettingStartedStepActionKey.IMPORT_DATA,
    GettingStartedStepActionKey.INVITE_TEAM,
    GettingStartedStepActionKey.FOLLOW_UP_DEALS,
  ])('goes back up to %s after going down', (selectedStepActionKey) => {
    const completedStepActionKeys = [
      GettingStartedStepActionKey.CONNECT_MAILBOX,
      GettingStartedStepActionKey.HANDOVER_DEALS,
    ];
    const { nextStepActionKey } = getGettingStartedAdjacentSteps({
      steps: mockGettingStartedStepDefinitions,
      completedStepActionKeys,
      selectedStepActionKey,
    });

    expect(
      getGettingStartedAdjacentSteps({
        steps: mockGettingStartedStepDefinitions,
        completedStepActionKeys,
        selectedStepActionKey: nextStepActionKey ?? selectedStepActionKey,
      }).previousStepActionKey,
    ).toBe(selectedStepActionKey);
  });
});
