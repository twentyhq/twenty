export type ApplicationLifecycleProgressReporter<TStep extends string> = {
  reportStepCompleted: (step: TStep) => Promise<void>;
};
