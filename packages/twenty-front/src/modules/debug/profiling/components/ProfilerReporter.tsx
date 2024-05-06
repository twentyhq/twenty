import { useRecoilState } from 'recoil';

import { profilingSessionState } from '@/debug/profiling/states/profilingSessionState';

export const ProfilerReporter = () => {
  const [profilingSession] = useRecoilState(profilingSessionState);

  return (
    <div
      style={{ width: 0, height: 0, visibility: 'hidden' }}
      data-profiling-report={JSON.stringify(profilingSession)}
      id="profiling-report"
    ></div>
  );
};
