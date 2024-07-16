import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { TIME_BETWEEN_TEST_RUNS_IN_MS } from '~/testing/profiling/constants/TimeBetweenTestRunsInMs';
import { currentProfilingRunIndexState } from '~/testing/profiling/states/currentProfilingRunIndexState';
import { profilingQueueState } from '~/testing/profiling/states/profilingQueueState';
import { profilingSessionRunsState } from '~/testing/profiling/states/profilingSessionRunsState';
import { profilingSessionStatusState } from '~/testing/profiling/states/profilingSessionStatusState';
import { getTestArray } from '~/testing/profiling/utils/getTestArray';
import { sleep } from '~/utils/sleep';

export const ProfilingQueueEffect = ({
  profilingId,
  numberOfTestsPerRun,
  numberOfRuns,
  warmUpRounds,
}: {
  profilingId: string;
  numberOfTestsPerRun: number;
  numberOfRuns: number;
  warmUpRounds: number;
}) => {
  const [currentProfilingRunIndex, setCurrentProfilingRunIndex] =
    useRecoilState(currentProfilingRunIndexState);

  const [profilingSessionStatus, setProfilingSessionStatus] = useRecoilState(
    profilingSessionStatusState,
  );

  const [profilingSessionRuns, setProfilingSessionRuns] = useRecoilState(
    profilingSessionRunsState,
  );

  const [profilingQueue, setProfilingQueue] =
    useRecoilState(profilingQueueState);

  useEffect(() => {
    (async () => {
      if (profilingSessionStatus === 'not_started') {
        setProfilingSessionStatus('running');
        setCurrentProfilingRunIndex(0);

        const newTestRuns = [
          ...[
            ...Array.from({ length: warmUpRounds }, (_, i) => `warm-up-${i}`),
          ],
          ...[
            ...Array.from({ length: numberOfRuns }, (_, i) => `real-run-${i}`),
          ],
          'finishing-run-1',
          'finishing-run-2',
          'finishing-run-3',
        ];

        setProfilingSessionRuns(newTestRuns);

        const testArray = getTestArray(
          profilingId,
          numberOfTestsPerRun,
          newTestRuns[0],
        );

        setProfilingQueue((currentProfilingQueue) => ({
          ...currentProfilingQueue,
          [newTestRuns[0]]: testArray,
        }));
      } else if (profilingSessionStatus === 'running') {
        const testsStillToRun =
          profilingQueue[profilingSessionRuns[currentProfilingRunIndex]];

        const allTestsAreRun = testsStillToRun.length > 0;

        const isFinalRun =
          currentProfilingRunIndex === profilingSessionRuns.length - 1;

        if (allTestsAreRun) {
          if (isFinalRun) {
            setProfilingSessionStatus('finished');
            return;
          }

          const timeInMs = profilingSessionRuns[
            currentProfilingRunIndex
          ].startsWith('warm-up')
            ? TIME_BETWEEN_TEST_RUNS_IN_MS * 2
            : TIME_BETWEEN_TEST_RUNS_IN_MS;

          await sleep(timeInMs);

          const nextIndex = currentProfilingRunIndex + 1;

          setCurrentProfilingRunIndex(nextIndex);

          const testArray = getTestArray(
            profilingId,
            numberOfTestsPerRun,
            profilingSessionRuns[nextIndex],
          );

          setProfilingQueue((currentProfilingQueue) => ({
            ...currentProfilingQueue,
            [profilingSessionRuns[nextIndex]]: testArray,
          }));
        }
      }
    })();
  }, [
    profilingQueue,
    numberOfTestsPerRun,
    profilingId,
    currentProfilingRunIndex,
    setProfilingQueue,
    setCurrentProfilingRunIndex,
    profilingSessionStatus,
    setProfilingSessionStatus,
    profilingSessionRuns,
    setProfilingSessionRuns,
    numberOfRuns,
    warmUpRounds,
  ]);

  return <></>;
};
