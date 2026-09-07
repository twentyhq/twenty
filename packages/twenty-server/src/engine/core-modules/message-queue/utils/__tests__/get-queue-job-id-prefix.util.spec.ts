import { buildQueueJobIdWithSuffix } from 'src/engine/core-modules/message-queue/utils/build-queue-job-id-with-suffix.util';
import { getQueueJobIdPrefix } from 'src/engine/core-modules/message-queue/utils/get-queue-job-id-prefix.util';

const PREFIX = 'install-application.workspace-id.application-id';
const SUFFIX = '5c98b035-5b09-4550-a4fb-b52056c494d1';

describe('getQueueJobIdPrefix', () => {
  it('strips the v4 suffix added by add', () => {
    expect(
      getQueueJobIdPrefix(
        buildQueueJobIdWithSuffix({ jobIdPrefix: PREFIX, suffix: SUFFIX }),
      ),
    ).toBe(PREFIX);
  });

  it('strips the v4 and batch index added by bulkAdd', () => {
    expect(getQueueJobIdPrefix(`${PREFIX}-${SUFFIX}-12`)).toBe(PREFIX);
  });

  it('leaves an id without a generated suffix unchanged', () => {
    expect(getQueueJobIdPrefix('workspace-id.custom-job-id')).toBe(
      'workspace-id.custom-job-id',
    );
  });
});
