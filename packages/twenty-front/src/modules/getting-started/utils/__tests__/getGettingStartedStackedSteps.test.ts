import { getGettingStartedStackedSteps } from '@/getting-started/utils/getGettingStartedStackedSteps';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';
import { mockGettingStartedStepDefinitions } from '~/testing/mock-data/gettingStartedSteps';

describe('getGettingStartedStackedSteps', () => {
  it.each([
    {
      description: 'stacks the steps after the selected one',
      steps: mockGettingStartedStepDefinitions,
      selectedStepActionKey: GettingStartedStepActionKey.IMPORT_DATA,
      expected: [
        GettingStartedStepActionKey.INSTALL_APP,
        GettingStartedStepActionKey.INVITE_TEAM,
        GettingStartedStepActionKey.HANDOVER_DEALS,
      ],
    },
    {
      description: 'wraps around to the first steps',
      steps: mockGettingStartedStepDefinitions,
      selectedStepActionKey: GettingStartedStepActionKey.HANDOVER_DEALS,
      expected: [
        GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        GettingStartedStepActionKey.CONNECT_MAILBOX,
        GettingStartedStepActionKey.IMPORT_DATA,
      ],
    },
    {
      description: 'stacks fewer steps when there are fewer than four',
      steps: mockGettingStartedStepDefinitions.slice(0, 2),
      selectedStepActionKey: GettingStartedStepActionKey.CONNECT_MAILBOX,
      expected: [GettingStartedStepActionKey.IMPORT_DATA],
    },
  ])('$description', ({ steps, selectedStepActionKey, expected }) => {
    expect(
      getGettingStartedStackedSteps({ steps, selectedStepActionKey }).map(
        ({ actionKey }) => actionKey,
      ),
    ).toEqual(expected);
  });
});
