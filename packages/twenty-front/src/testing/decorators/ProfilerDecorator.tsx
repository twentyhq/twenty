import { type Decorator } from '@storybook/react';
import { useRecoilState } from 'recoil';

import { ProfilerWrapper } from '~/testing/profiling/components/ProfilerWrapper';
import { ProfilingQueueEffect } from '~/testing/profiling/components/ProfilingQueueEffect';
import { ProfilingReporter } from '~/testing/profiling/components/ProfilingReporter';
import { currentProfilingRunIndexState } from '~/testing/profiling/states/currentProfilingRunIndexState';
import { profilingSessionRunsState } from '~/testing/profiling/states/profilingSessionRunsState';
import { profilingSessionStatusState } from '~/testing/profiling/states/profilingSessionStatusState';
import { getTestArray } from '~/testing/profiling/utils/getTestArray';

export const ProfilerDecorator: Decorator = (Story, { id, parameters }) => {
  const numberOfTests = parameters.numberOfTests ?? 2;
  const numberOfRuns = parameters.numberOfRuns ?? 2;
  const warmUpRounds = parameters.warmUpRounds ?? 5;

  const [currentProfilingRunIndex] = useRecoilState(
    currentProfilingRunIndexState,
  );

  const [profilingSessionStatus] = useRecoilState(profilingSessionStatusState);
  const [profilingSessionRuns] = useRecoilState(profilingSessionRunsState);

  const skip = profilingSessionRuns.length === 0;

  const currentRunName = profilingSessionRuns[currentProfilingRunIndex];

  const testArray = getTestArray(id, numberOfTests, currentRunName);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <ProfilingQueueEffect
        numberOfRuns={numberOfRuns}
        numberOfTestsPerRun={numberOfTests}
        warmUpRounds={warmUpRounds}
        profilingId={id}
      />
      <div>
        Profiling {numberOfTests} times the component {parameters.componentName}{' '}
        :
      </div>
      {skip ? (
        <></>
      ) : (
        <>
          <ProfilingReporter />
          <div style={{ visibility: 'hidden', width: 0, height: 0 }}>
            {testArray.map((_, index) => (
              <ProfilerWrapper
                key={id + index}
                componentName={parameters.componentName}
                runName={currentRunName}
                testIndex={index}
                profilingId={id}
              >
                <Story />
              </ProfilerWrapper>
            ))}
          </div>
          {profilingSessionStatus === 'finished' && (
            <div data-testid="profiling-session-finished" />
          )}
        </>
      )}
    </div>
  );
};
