import { Profiler } from 'react';
import { Interaction } from 'scheduler/tracing';

import { logDebug } from '~/utils/logDebug';

type TimingProfilerProps = {
  id: string;
  children: React.ReactNode;
};

export const TimingProfiler = ({ id, children }: TimingProfilerProps) => {
  const handleRender = (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
    interactions: Set<Interaction>,
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
          interactions,
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
