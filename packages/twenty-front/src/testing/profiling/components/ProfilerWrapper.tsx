import { Profiler, type ProfilerOnRenderCallback, useCallback } from 'react';

import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { profilingQueueState } from '~/testing/profiling/states/profilingQueueState';
import { profilingSessionDataPointsState } from '~/testing/profiling/states/profilingSessionDataPointsState';
import { profilingSessionState } from '~/testing/profiling/states/profilingSessionState';
import { type ProfilingDataPoint } from '~/testing/profiling/types/ProfilingDataPoint';
import { getProfilingQueueIdentifier } from '~/testing/profiling/utils/getProfilingQueueIdentifier';
import { isDefined } from 'twenty-shared/utils';

export const ProfilerWrapper = ({
  profilingId,
  testIndex,
  componentName,
  runName,
  children,
}: {
  profilingId: string;
  testIndex: number;
  componentName: string;
  runName: string;
  children: React.ReactNode;
}) => {
  const handleRender: ProfilerOnRenderCallback = useCallback(
    (id, phase, actualDurationInMs) => {
      const dataPointId = getProfilingQueueIdentifier(
        profilingId,
        testIndex,
        runName,
      );

      const newDataPoint: ProfilingDataPoint = {
        componentName,
        runName,
        id: dataPointId,
        phase,
        durationInMs: actualDurationInMs,
      };

      jotaiStore.set(
        profilingSessionDataPointsState.atom,
        (currentProfilingSessionDataPoints) => [
          ...currentProfilingSessionDataPoints,
          newDataPoint,
        ],
      );

      jotaiStore.set(profilingSessionState.atom, (currentProfilingSession) => ({
        ...currentProfilingSession,
        [id]: [...(currentProfilingSession[id] ?? []), newDataPoint],
      }));

      const queueIdentifier = dataPointId;

      const currentProfilingQueue = jotaiStore.get(profilingQueueState.atom);

      const currentQueue = currentProfilingQueue[runName];

      if (!isDefined(currentQueue)) {
        return;
      }

      const newQueue = currentQueue.filter((id) => id !== queueIdentifier);

      jotaiStore.set(profilingQueueState.atom, (currentProfilingQueue) => ({
        ...currentProfilingQueue,
        [runName]: newQueue,
      }));
    },
    [profilingId, testIndex, componentName, runName],
  );

  return (
    <Profiler id={profilingId} onRender={handleRender}>
      {children}
    </Profiler>
  );
};
