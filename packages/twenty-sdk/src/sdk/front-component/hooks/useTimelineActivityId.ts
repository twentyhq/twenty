import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

export const useTimelineActivityId = (): string | null =>
  useFrontComponentExecutionContext((context) => context.timelineActivityId);
