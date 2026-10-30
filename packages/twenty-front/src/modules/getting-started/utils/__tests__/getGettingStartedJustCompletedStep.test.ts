import { getGettingStartedJustCompletedStep } from '@/getting-started/utils/getGettingStartedJustCompletedStep';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';
import { mockGettingStartedStepDefinitions } from '~/testing/mock-data/gettingStartedSteps';

const PREVIOUS_PROGRESS = {
  steps: mockGettingStartedStepDefinitions,
  completedStepActionKeys: [GettingStartedStepActionKey.CONNECT_MAILBOX],
  selectedStepActionKey: GettingStartedStepActionKey.INVITE_TEAM,
};

describe('getGettingStartedJustCompletedStep', () => {
  it('returns the displayed step when it goes from open to done', () => {
    expect(
      getGettingStartedJustCompletedStep({
        previousProgress: PREVIOUS_PROGRESS,
        progress: {
          completedStepActionKeys: [
            GettingStartedStepActionKey.CONNECT_MAILBOX,
            GettingStartedStepActionKey.INVITE_TEAM,
          ],
        },
      }),
    ).toBe(GettingStartedStepActionKey.INVITE_TEAM);
  });

  it('falls back to the first remaining step when none is selected', () => {
    expect(
      getGettingStartedJustCompletedStep({
        previousProgress: { ...PREVIOUS_PROGRESS, selectedStepActionKey: null },
        progress: {
          completedStepActionKeys: [
            GettingStartedStepActionKey.CONNECT_MAILBOX,
            GettingStartedStepActionKey.IMPORT_DATA,
          ],
        },
      }),
    ).toBe(GettingStartedStepActionKey.IMPORT_DATA);
  });

  it('returns null on the first progress, so a page load never animates', () => {
    expect(
      getGettingStartedJustCompletedStep({
        previousProgress: undefined,
        progress: {
          completedStepActionKeys: [GettingStartedStepActionKey.INVITE_TEAM],
        },
      }),
    ).toBeNull();
  });

  it('returns null when a step other than the displayed one completes', () => {
    expect(
      getGettingStartedJustCompletedStep({
        previousProgress: PREVIOUS_PROGRESS,
        progress: {
          completedStepActionKeys: [
            GettingStartedStepActionKey.CONNECT_MAILBOX,
            GettingStartedStepActionKey.INSTALL_APP,
          ],
        },
      }),
    ).toBeNull();
  });

  it('returns null when the displayed step was already done', () => {
    expect(
      getGettingStartedJustCompletedStep({
        previousProgress: {
          ...PREVIOUS_PROGRESS,
          selectedStepActionKey: GettingStartedStepActionKey.CONNECT_MAILBOX,
        },
        progress: {
          completedStepActionKeys: [
            GettingStartedStepActionKey.CONNECT_MAILBOX,
            GettingStartedStepActionKey.INVITE_TEAM,
          ],
        },
      }),
    ).toBeNull();
  });
});
