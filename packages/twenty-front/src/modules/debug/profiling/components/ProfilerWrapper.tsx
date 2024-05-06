import { Profiler, ProfilerOnRenderCallback } from 'react';
import { useRecoilCallback } from 'recoil';

import { profilingSessionState } from '@/debug/profiling/states/profilingSessionState';
import { ProfilingDataPoint } from '@/debug/profiling/types/ProfilingDataPoint';

export const ProfilerWrapper = ({
  id,
  componentName,
  children,
}: {
  id: string;
  componentName: string;
  children: React.ReactNode;
}) => {
  const handleRender: ProfilerOnRenderCallback = useRecoilCallback(
    ({ set }) =>
      (id, phase, actualDurationInMs) => {
        const newDataPoint: ProfilingDataPoint = {
          componentName,
          id,
          phase,
          durationInMs: actualDurationInMs,
        };

        set(profilingSessionState, (currentProfilingSession) => ({
          ...currentProfilingSession,
          [id]: [...(currentProfilingSession[id] ?? []), newDataPoint],
        }));
      },
    [componentName],
  );

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
};
