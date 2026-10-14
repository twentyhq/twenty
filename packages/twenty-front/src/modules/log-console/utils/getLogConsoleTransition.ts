import { LOG_CONSOLE_TRANSITION_TIMING } from '@/log-console/constants/LogConsoleTransitionTiming';

export const getLogConsoleTransition = ({
  isResizing,
  properties,
}: {
  isResizing: boolean;
  properties: string[];
}) =>
  isResizing
    ? 'none'
    : properties
        .map((property) => `${property} ${LOG_CONSOLE_TRANSITION_TIMING}`)
        .join(', ');
