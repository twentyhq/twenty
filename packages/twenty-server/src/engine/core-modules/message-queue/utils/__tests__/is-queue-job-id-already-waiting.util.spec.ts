import { isQueueJobIdAlreadyWaiting } from 'src/engine/core-modules/message-queue/utils/is-queue-job-id-already-waiting.util';

const PREFIX = 'install-application.workspace-id.application-id';
const SUFFIX = '5c98b035-5b09-4550-a4fb-b52056c494d1';

describe('isQueueJobIdAlreadyWaiting', () => {
  const waitingJobIds = [`${PREFIX}-${SUFFIX}`, 'workspace-id.custom-job-id'];

  it('matches a waiting job generated from the prefix', () => {
    expect(
      isQueueJobIdAlreadyWaiting({ waitingJobIds, jobIdOrPrefix: PREFIX }),
    ).toBe(true);
  });

  it('matches a waiting job on its exact id', () => {
    expect(
      isQueueJobIdAlreadyWaiting({
        waitingJobIds,
        jobIdOrPrefix: 'workspace-id.custom-job-id',
      }),
    ).toBe(true);
  });

  it('does not match another prefix', () => {
    expect(
      isQueueJobIdAlreadyWaiting({
        waitingJobIds,
        jobIdOrPrefix: 'install-application.workspace-id.other-application',
      }),
    ).toBe(false);
  });
});
