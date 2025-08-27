import { Profiler, type ProfilerOnRenderCallback } from 'react';
import { useRecoilCallback } from 'recoil';
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
  const handleRender: ProfilerOnRenderCallback = useRecoilCallback(
    ({ set, snapshot }) =>
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

        set(
          profilingSessionDataPointsState,
          (currentProfilingSessionDataPoints) => [
            ...currentProfilingSessionDataPoints,
            newDataPoint,
          ],
        );

        set(profilingSessionState, (currentProfilingSession) => ({
          ...currentProfilingSession,
          [id]: [...(currentProfilingSession[id] ?? []), newDataPoint],
        }));

        const queueIdentifier = dataPointId;

        const currentProfilingQueue = snapshot
          .getLoadable(profilingQueueState)
          .getValue();

        const currentQueue = currentProfilingQueue[runName];

        if (!isDefined(currentQueue)) {
          return;
        }

        const newQueue = currentQueue.filter((id) => id !== queueIdentifier);

        set(profilingQueueState, (currentProfilingQueue) => ({
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
