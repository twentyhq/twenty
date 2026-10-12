import { findInFlightQueueJobIdByPrefix } from 'src/engine/core-modules/message-queue/utils/find-in-flight-queue-job-id-by-prefix.util';

const PREFIX = 'install-application.workspace-id.application-id';
const JOB_ID = `${PREFIX}-5c98b035-5b09-4550-a4fb-b52056c494d1`;

describe('findInFlightQueueJobIdByPrefix', () => {
  const inFlightJobs = [
    { id: undefined, data: {} },
    { id: 'workspace-id.custom-job-id', data: {} },
    { id: JOB_ID, data: {} },
  ];

  it('returns the in-flight job generated from the prefix', () => {
    expect(
      findInFlightQueueJobIdByPrefix({ inFlightJobs, jobIdPrefix: PREFIX }),
    ).toBe(JOB_ID);
  });

  it('returns undefined when no in-flight job has the prefix', () => {
    expect(
      findInFlightQueueJobIdByPrefix({
        inFlightJobs,
        jobIdPrefix: 'install-application.workspace-id.other-application',
      }),
    ).toBeUndefined();
  });
});
