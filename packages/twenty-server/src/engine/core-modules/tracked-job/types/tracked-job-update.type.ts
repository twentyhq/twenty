export type TrackedJobUpdate<TProgress> = {
  status: 'running' | 'completed' | 'failed';
  percentage: number;
  progress?: TProgress;
  errorMessage: string | null;
};
