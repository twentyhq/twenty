import {
  type OrchestratorStateEvent,
  type OrchestratorStateSyncStatus,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { DevUiApplicationPanel } from '@/cli/utilities/dev/ui/components/dev-ui-application-panel';
import { DevUiEntityLegend } from '@/cli/utilities/dev/ui/components/dev-ui-entity-section';
import { DevUiEventItem } from '@/cli/utilities/dev/ui/components/dev-ui-event-log';
import { InkProvider, useInk } from '@/cli/utilities/dev/ui/dev-ui-ink-context';
import { type DevUiStateManager } from '@/cli/utilities/dev/ui/dev-ui-state-manager';
import React, { useCallback, useEffect, useReducer, useRef } from 'react';

const ACTIVE_PIPELINE_STATUSES = new Set<OrchestratorStateSyncStatus>([
  'building',
  'syncing',
]);
const ANIMATION_TICK_MS = 120;
const SETTLE_DELAY_MS = 80;

const DevUI = ({
  uiStateManager,
}: {
  uiStateManager: DevUiStateManager;
}): React.ReactElement => {
  const { Box, Static } = useInk();

  const [, forceRender] = useReducer((tick: number) => tick + 1, 0);

  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStateRenderRef = useRef(0);

  const scheduleSettledRender = useCallback(() => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
    }

    settleTimerRef.current = setTimeout(() => {
      settleTimerRef.current = null;
      lastStateRenderRef.current = Date.now();
      forceRender();
    }, SETTLE_DELAY_MS);
  }, []);

  useEffect(() => {
    return uiStateManager.subscribe(() => {
      scheduleSettledRender();
    });
  }, [uiStateManager, scheduleSettledRender]);

  useEffect(() => {
    const timer = setInterval(() => {
      const snapshot = uiStateManager.getSnapshot();

      if (!ACTIVE_PIPELINE_STATUSES.has(snapshot.pipeline.status)) {
        return;
      }

      // Skip if a state-change render happened recently to avoid
      // double-rendering while Static items are being added.
      if (Date.now() - lastStateRenderRef.current < ANIMATION_TICK_MS) {
        return;
      }

      forceRender();
    }, ANIMATION_TICK_MS);

    return () => clearInterval(timer);
  }, [uiStateManager]);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    };
  }, []);

  const state = uiStateManager.getSnapshot();

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
