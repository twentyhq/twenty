import { Profiler, type ProfilerOnRenderCallback } from 'react';

import { logDebug } from '~/utils/logDebug';

type TimingProfilerProps = {
  id: string;
  children: React.ReactNode;
};

export const TimingProfiler = ({ id, children }: TimingProfilerProps) => {
  const handleRender: ProfilerOnRenderCallback = (
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
  ) => {
    logDebug(
      'TimingProfiler',
      JSON.stringify(
        {
          id,
          phase,
          actualDuration,
          baseDuration,
          startTime,
          commitTime,
        },
        null,
        2,
      ),
    );
  };

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
};
