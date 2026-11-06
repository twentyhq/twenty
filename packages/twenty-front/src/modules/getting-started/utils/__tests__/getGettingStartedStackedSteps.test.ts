import { getGettingStartedStackedSteps } from '@/getting-started/utils/getGettingStartedStackedSteps';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';
import {
  mockGettingStartedStepActionKeys,
  mockGettingStartedStepDefinitions,
} from '~/testing/mock-data/gettingStartedSteps';

describe('getGettingStartedStackedSteps', () => {
  it.each([
    {
      description: 'stacks the step Skip brings in first',
      steps: mockGettingStartedStepDefinitions,
      completedStepActionKeys: [],
      selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
      expected: [
        GettingStartedStepActionKey.HANDOVER_DEALS,
        GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        GettingStartedStepActionKey.CONNECT_MAILBOX,
      ],
    },
    {
      description: 'moves the done steps to the back',
      steps: mockGettingStartedStepDefinitions,
      completedStepActionKeys: [
        GettingStartedStepActionKey.CONNECT_MAILBOX,
        GettingStartedStepActionKey.IMPORT_DATA,
        GettingStartedStepActionKey.INSTALL_APP,
      ],
      selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
      expected: [
        GettingStartedStepActionKey.HANDOVER_DEALS,
        GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        GettingStartedStepActionKey.CONNECT_MAILBOX,
      ],
    },
    {
      description: 'stacks the current step first from a done step',
      steps: mockGettingStartedStepDefinitions,
      completedStepActionKeys: [
        GettingStartedStepActionKey.CONNECT_MAILBOX,
        GettingStartedStepActionKey.INVITE_TEAM,
      ],
      selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
      expected: [
        GettingStartedStepActionKey.IMPORT_DATA,
        GettingStartedStepActionKey.INSTALL_APP,
        GettingStartedStepActionKey.HANDOVER_DEALS,
      ],
    },
    {
      description: 'keeps the step order once every step is done',
      steps: mockGettingStartedStepDefinitions,
      completedStepActionKeys: mockGettingStartedStepActionKeys,
      selectedStepActionKey: GettingStartedStepActionKey.CONNECT_MAILBOX,
      expected: [
        GettingStartedStepActionKey.IMPORT_DATA,
        GettingStartedStepActionKey.INSTALL_APP,
        GettingStartedStepActionKey.INVITE_TEAM,
      ],
    },
    {
      description:
        'stacks the steps after the selected one once every step is done',
      steps: mockGettingStartedStepDefinitions,
      completedStepActionKeys: mockGettingStartedStepActionKeys,
      selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
      expected: [
        GettingStartedStepActionKey.HANDOVER_DEALS,
        GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        GettingStartedStepActionKey.CONNECT_MAILBOX,
      ],
    },
    {
      description: 'stacks fewer steps when there are fewer than four',
      steps: mockGettingStartedStepDefinitions.slice(0, 2),
      completedStepActionKeys: [],
      selectedStepActionKey: GettingStartedStepActionKey.CONNECT_MAILBOX,
      expected: [GettingStartedStepActionKey.IMPORT_DATA],
    },
  ])(
    '$description',
    ({ steps, completedStepActionKeys, selectedStepActionKey, expected }) => {
      expect(
        getGettingStartedStackedSteps({
          steps,
          completedStepActionKeys,
          selectedStepActionKey,
        }).map(({ actionKey }) => actionKey),
      ).toEqual(expected);
    },
  );
});
