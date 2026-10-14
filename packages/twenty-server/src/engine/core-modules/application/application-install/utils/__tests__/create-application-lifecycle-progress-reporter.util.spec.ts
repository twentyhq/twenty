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

  describe('reportStepProgressDuring', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('reports elapsed time progress within the step until it finishes', async () => {
      const updateProgress = jest.fn().mockResolvedValue(undefined);
      const reporter = createApplicationLifecycleProgressReporter({
        steps: STEPS,
        updateProgress,
      });
      let finishStep = () => {};

      const stepRun = reporter.reportStepProgressDuring({
        step: 'SECOND',
        expectedDurationMs: 10_000,
        run: () =>
          new Promise<void>((resolve) => {
            finishStep = resolve;
          }),
      });

      await jest.advanceTimersByTimeAsync(5_000);
      finishStep();
      await stepRun;
      await jest.advanceTimersByTimeAsync(5_000);

      expect(updateProgress.mock.calls).toEqual([[28], [30], [33], [35], [38]]);
    });

    it('stops at the step boundary when the step outlasts its expected duration', async () => {
      const updateProgress = jest.fn().mockResolvedValue(undefined);
      const reporter = createApplicationLifecycleProgressReporter({
        steps: STEPS,
        updateProgress,
      });

      const stepRun = reporter.reportStepProgressDuring({
        step: 'SECOND',
        expectedDurationMs: 2_000,
        run: () => new Promise<void>((resolve) => setTimeout(resolve, 5_000)),
      });

      await jest.advanceTimersByTimeAsync(5_000);
      await stepRun;
      await reporter.reportStepCompleted('SECOND');
      await reporter.reportStepCompleted('THIRD');

      expect(updateProgress.mock.calls).toEqual([[38], [50], [75]]);
    });

    it('runs the step without an updateProgress callback', async () => {
      const reporter = createApplicationLifecycleProgressReporter({
        steps: STEPS,
      });
      const run = jest.fn().mockResolvedValue(undefined);

      await reporter.reportStepProgressDuring({
        step: 'FIRST',
        expectedDurationMs: 1_000,
        run,
      });

      expect(run).toHaveBeenCalledTimes(1);
    });
  });
});
