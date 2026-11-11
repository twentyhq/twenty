import { type CoreWorkflowRunSummary } from '@/object-core/workflows/types/CoreWorkflowRunSummary';

export type CoreWorkflowRecentRun =
  CoreWorkflowRunSummary['recentRuns'][number];
