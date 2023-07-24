import { Profiler } from 'react';
import { Interaction } from 'scheduler/tracing';

type OwnProps = {
  id: string;
  children: React.ReactNode;
};

export function TimingProfiler({ id, children }: OwnProps) {
  function handleRender(
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
    interactions: Set<Interaction>,
  ) {
    console.log(
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
  }

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
}
