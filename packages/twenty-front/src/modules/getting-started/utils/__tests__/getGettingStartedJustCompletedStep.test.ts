import { getGettingStartedJustCompletedStep } from '@/getting-started/utils/getGettingStartedJustCompletedStep';
import { GettingStartedStep } from '~/generated-metadata/graphql';
import { mockGettingStartedStepDefinitions } from '~/testing/mock-data/gettingStartedSteps';

const PREVIOUS_PROGRESS = {
  steps: mockGettingStartedStepDefinitions,
  completedSteps: [GettingStartedStep.CONNECT_MAILBOX],
  selectedStep: GettingStartedStep.INVITE_TEAM,
};

describe('getGettingStartedJustCompletedStep', () => {
  it('returns the displayed step when it goes from open to done', () => {
    expect(
      getGettingStartedJustCompletedStep({
        previousProgress: PREVIOUS_PROGRESS,
        progress: {
          completedSteps: [
            GettingStartedStep.CONNECT_MAILBOX,
            GettingStartedStep.INVITE_TEAM,
          ],
        },
      }),
    ).toBe(GettingStartedStep.INVITE_TEAM);
  });

  it('falls back to the first remaining step when none is selected', () => {
    expect(
      getGettingStartedJustCompletedStep({
        previousProgress: { ...PREVIOUS_PROGRESS, selectedStep: null },
        progress: {
          completedSteps: [
            GettingStartedStep.CONNECT_MAILBOX,
            GettingStartedStep.IMPORT_DATA,
          ],
        },
      }),
    ).toBe(GettingStartedStep.IMPORT_DATA);
  });

  it('returns null on the first progress, so a page load never animates', () => {
    expect(
      getGettingStartedJustCompletedStep({
        previousProgress: undefined,
        progress: { completedSteps: [GettingStartedStep.INVITE_TEAM] },
      }),
    ).toBeNull();
  });

  it('returns null when a step other than the displayed one completes', () => {
    expect(
      getGettingStartedJustCompletedStep({
        previousProgress: PREVIOUS_PROGRESS,
        progress: {
          completedSteps: [
            GettingStartedStep.CONNECT_MAILBOX,
            GettingStartedStep.INSTALL_APP,
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
          selectedStep: GettingStartedStep.CONNECT_MAILBOX,
        },
        progress: {
          completedSteps: [
            GettingStartedStep.CONNECT_MAILBOX,
            GettingStartedStep.INVITE_TEAM,
          ],
        },
      }),
    ).toBeNull();
  });
});
