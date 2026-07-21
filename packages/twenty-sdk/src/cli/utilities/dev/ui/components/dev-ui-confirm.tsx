import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { useInk } from '@/cli/utilities/dev/ui/dev-ui-ink-context';
import React from 'react';

export const DevUiConfirm = ({
  state,
}: {
  state: OrchestratorState;
}): React.ReactElement | null => {
  const { Box, Text, useInput } = useInk();
  const pending = state.pendingConfirmation;

  useInput((input, key) => {
    if (!state.pendingConfirmation) {
      return;
    }

    if (input.toLowerCase() === 'y') {
      state.resolveDestructiveConfirmation(true);

      return;
    }

    if (input.toLowerCase() === 'n' || key.escape) {
      state.resolveDestructiveConfirmation(false);
    }
  });

  if (!pending) {
    return null;
  }

  return (
    <Box
      marginTop={1}
      flexDirection="column"
      borderStyle="classic"
      borderColor="red"
      paddingX={1}
    >
      <Text color="red" bold>
        ⚠ {pending.deleteCount} destructive change(s) detected
      </Text>
      <Text>
        Apply and DESTROY {pending.deleteCount} metadata entity(ies)? Press{' '}
        <Text color="green" bold>
          y
        </Text>{' '}
        to apply,{' '}
        <Text color="red" bold>
          n
        </Text>{' '}
        to cancel and stop watching.
      </Text>
    </Box>
  );
};
