import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { currentProfilingRunIndexState } from '~/testing/profiling/states/currentProfilingRunState';
import { profilingQueueState } from '~/testing/profiling/states/profilingQueueState';
import { profilingSessionRunsState } from '~/testing/profiling/states/profilingSessionRunsState';
import { profilingSessionStatusState } from '~/testing/profiling/states/profilingSessionStatusState';

const TIME_BETWEEN_TEST_RUNS_IN_MS = 5000;

export const getQueueIdentifier = (
  profilingId: string,
  testIndex: number,
  runName: string,
) => `${profilingId}-run[${runName}]-test[${testIndex}]`;

export const getTestArray = (
  profilingId: string,
  numberOfTestsPerRun: number,
  runName: string,
) => {
  const testArray = Array.from({ length: numberOfTestsPerRun }, (_, i) =>
    getQueueIdentifier(profilingId, i, runName),
  );

  return testArray;
};

export const ProfilingQueueEffect = ({
  profilingId,
  numberOfTestsPerRun,
  numberOfRuns,
}: {
  profilingId: string;
  numberOfTestsPerRun: number;
  numberOfRuns: number;
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
          'warm-up-1',
          'warm-up-2',
          'warm-up-3',
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

          await new Promise((resolve) =>
            setTimeout(resolve, TIME_BETWEEN_TEST_RUNS_IN_MS),
          );

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
  ]);

  return <></>;
};
