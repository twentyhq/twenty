import { useEffect } from 'react';

import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { TIME_BETWEEN_TEST_RUNS_IN_MS } from '~/testing/profiling/constants/TimeBetweenTestRunsInMs';
import { currentProfilingRunIndexState } from '~/testing/profiling/states/currentProfilingRunIndexState';
import { profilingQueueState } from '~/testing/profiling/states/profilingQueueState';
import { profilingSessionRunsState } from '~/testing/profiling/states/profilingSessionRunsState';
import { profilingSessionStatusState } from '~/testing/profiling/states/profilingSessionStatusState';
import { getTestArray } from '~/testing/profiling/utils/getTestArray';
import { sleep } from '~/utils/sleep';
import { isDefined } from 'twenty-shared/utils';

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
  const [currentProfilingRunIndex, setCurrentProfilingRunIndex] = useAtomState(
    currentProfilingRunIndexState,
  );

  const [profilingSessionStatus, setProfilingSessionStatus] = useAtomState(
    profilingSessionStatusState,
  );

  const [profilingSessionRuns, setProfilingSessionRuns] = useAtomState(
    profilingSessionRunsState,
  );

  const [profilingQueue, setProfilingQueue] = useAtomState(profilingQueueState);

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

        const [firstRunName] = newTestRuns;

        if (!isDefined(firstRunName)) {
          return;
        }

        const testArray = getTestArray(
          profilingId,
          numberOfTestsPerRun,
          firstRunName,
        );

        setProfilingQueue((currentProfilingQueue) => ({
          ...currentProfilingQueue,
          [firstRunName]: testArray,
        }));
      } else if (profilingSessionStatus === 'running') {
        const currentRunName = profilingSessionRuns[currentProfilingRunIndex];
        const testsStillToRun = isDefined(currentRunName)
          ? profilingQueue[currentRunName]
          : undefined;

        if (!isDefined(testsStillToRun)) {
          return;
        }

        const allTestsAreRun = testsStillToRun.length > 0;

        const isFinalRun =
          currentProfilingRunIndex === profilingSessionRuns.length - 1;

        if (allTestsAreRun) {
          if (isFinalRun) {
            setProfilingSessionStatus('finished');
            return;
          }

          const timeInMs = currentRunName?.startsWith('warm-up')
            ? TIME_BETWEEN_TEST_RUNS_IN_MS * 2
            : TIME_BETWEEN_TEST_RUNS_IN_MS;

          await sleep(timeInMs);

          const nextIndex = currentProfilingRunIndex + 1;
          const nextRunName = profilingSessionRuns[nextIndex];

          setCurrentProfilingRunIndex(nextIndex);

          if (!isDefined(nextRunName)) {
            return;
          }

          const testArray = getTestArray(
            profilingId,
            numberOfTestsPerRun,
            nextRunName,
          );

          setProfilingQueue((currentProfilingQueue) => ({
            ...currentProfilingQueue,
            [nextRunName]: testArray,
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
