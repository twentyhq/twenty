import { type OrchestratorStateEvent } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import {
  EVENT_COLORS,
  formatTime,
} from '@/cli/utilities/dev/ui/dev-ui-constants';
import { useInk } from '@/cli/utilities/dev/ui/dev-ui-ink-context';
import React from 'react';

export const DevUiEventItem = ({
  event,
}: {
  event: OrchestratorStateEvent;
}): React.ReactElement => {
  const { Box, Text } = useInk();
  const color = EVENT_COLORS[event.status];
  const time = formatTime(event.timestamp);

  return (
    <Box>
      <Text dimColor>{time} </Text>
      <Text color={color}>{event.message}</Text>
    </Box>
  );
};
