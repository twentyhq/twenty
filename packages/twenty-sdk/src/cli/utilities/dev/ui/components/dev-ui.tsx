import { type OrchestratorStateEvent } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { DevUiApplicationPanel } from '@/cli/utilities/dev/ui/components/dev-ui-application-panel';
import { DevUiEntityLegend } from '@/cli/utilities/dev/ui/components/dev-ui-entity-section';
import { DevUiEventItem } from '@/cli/utilities/dev/ui/components/dev-ui-event-log';
import { InkProvider, useInk } from '@/cli/utilities/dev/ui/dev-ui-ink-context';
import { type DevUiStateManager } from '@/cli/utilities/dev/ui/dev-ui-state-manager';
import React, { useReducer, useEffect } from 'react';

const ACTIVE_PIPELINE_STATUSES = new Set(['building', 'syncing']);
const ANIMATION_TICK_MS = 120;

const DevUI = ({
  uiStateManager,
}: {
  uiStateManager: DevUiStateManager;
}): React.ReactElement => {
  const { Box, Static } = useInk();

  const [, forceRender] = useReducer((tick: number) => tick + 1, 0);

  useEffect(() => {
    return uiStateManager.subscribe(() => forceRender());
  }, [uiStateManager]);

  const state = uiStateManager.getSnapshot();
  const isActive = ACTIVE_PIPELINE_STATUSES.has(state.pipeline.status);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const timer = setInterval(() => forceRender(), ANIMATION_TICK_MS);

    return () => clearInterval(timer);
  }, [isActive]);

  return (
    <>
      <Static items={state.events}>
        {(event: OrchestratorStateEvent) => (
          <DevUiEventItem key={event.id} event={event} />
        )}
      </Static>

      <Box marginTop={1} flexDirection="column">
        <DevUiApplicationPanel state={state} />
        <DevUiEntityLegend />
      </Box>
    </>
  );
};

export const renderDevUI = async (
  uiStateManager: DevUiStateManager,
): Promise<{ unmount: () => void }> => {
  const ink = await import('ink');
  const { render, Box, Text, Static } = ink;

  const { unmount } = render(
    <InkProvider value={{ Box, Text, Static }}>
      <DevUI uiStateManager={uiStateManager} />
    </InkProvider>,
    { incrementalRendering: true },
  );

  return { unmount };
};
