export type ApplicationLifecycleProgressReporter<TStep extends string> = {
  reportStepCompleted: (step: TStep) => Promise<void>;
  reportStepProgressDuring: (params: {
    step: TStep;
    expectedDurationMs: number;
    run: () => Promise<void>;
  }) => Promise<void>;
};
