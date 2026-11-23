import { getGettingStartedStepSelection } from '@/getting-started/utils/getGettingStartedStepSelection';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';
import { mockGettingStartedStepActionKeys } from '~/testing/mock-data/gettingStartedSteps';

describe('getGettingStartedStepSelection', () => {
  it.each([
    {
      description: 'keeps the saved step and skips to the next remaining step',
      completedStepActionKeys: [GettingStartedStepActionKey.HANDOVER_DEALS],
      selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
      expected: {
        selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
        nextStep: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
      },
    },
    {
      description: 'wraps to the first remaining step',
      completedStepActionKeys: [],
      selectedStepActionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
      expected: {
        selectedStepActionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        nextStep: GettingStartedStepActionKey.CONNECT_MAILBOX,
      },
    },
    {
      description: 'selects the first step once every step is completed',
      completedStepActionKeys: mockGettingStartedStepActionKeys,
      selectedStepActionKey: null,
      expected: {
        selectedStepActionKey: GettingStartedStepActionKey.CONNECT_MAILBOX,
        nextStep: GettingStartedStepActionKey.CONNECT_MAILBOX,
      },
    },
    {
      description: 'goes from a completed step to the next remaining step',
      completedStepActionKeys: [GettingStartedStepActionKey.INVITE_TEAM],
      selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
      expected: {
        selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
        nextStep: GettingStartedStepActionKey.HANDOVER_DEALS,
      },
    },
  ])(
    '$description',
    ({ completedStepActionKeys, selectedStepActionKey, expected }) => {
      expect(
        getGettingStartedStepSelection({
          stepActionKeys: mockGettingStartedStepActionKeys,
          completedStepActionKeys,
          selectedStepActionKey,
        }),
      ).toEqual(expected);
    },
  );
});
