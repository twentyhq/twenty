import { createApplicationLifecycleProgressReporter } from 'src/engine/core-modules/application/application-install/utils/create-application-lifecycle-progress-reporter.util';

const STEPS = ['FIRST', 'SECOND', 'THIRD', 'FOURTH'] as const;

describe('createApplicationLifecycleProgressReporter', () => {
  it('reports the percentage of completed steps', async () => {
    const updateProgress = jest.fn().mockResolvedValue(undefined);
    const reporter = createApplicationLifecycleProgressReporter({
      steps: STEPS,
      updateProgress,
    });

    await reporter.reportStepCompleted('FIRST');
    await reporter.reportStepCompleted('THIRD');
    await reporter.reportStepCompleted('FOURTH');

    expect(updateProgress.mock.calls).toEqual([[25], [75], [100]]);
  });

  it('is a no-op without an updateProgress callback', async () => {
    const reporter = createApplicationLifecycleProgressReporter({
      steps: STEPS,
    });

    await expect(
      reporter.reportStepCompleted('FIRST'),
    ).resolves.toBeUndefined();
  });

  it('swallows progress update failures', async () => {
    const updateProgress = jest
      .fn()
      .mockRejectedValue(new Error('job lock lost'));
    const reporter = createApplicationLifecycleProgressReporter({
      steps: STEPS,
      updateProgress,
    });

    await expect(
      reporter.reportStepCompleted('SECOND'),
    ).resolves.toBeUndefined();
    expect(updateProgress).toHaveBeenCalledWith(50);
  });
});
