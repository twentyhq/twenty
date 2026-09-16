import { describe, expect, it } from 'vitest';

import { buildExportJobId } from 'src/logic-functions/data/build-export-job-id.util';

const CONNECTION_ID = '6f1d2e3a-4b5c-4d6e-8f90-a1b2c3d4e5f6';

describe('buildExportJobId', () => {
  it('should give the same selection the same id however it is ordered', () => {
    expect(
      buildExportJobId({ connectionId: CONNECTION_ID, recordIds: ['a', 'b'] }),
    ).toBe(
      buildExportJobId({ connectionId: CONNECTION_ID, recordIds: ['b', 'a'] }),
    );
  });

  it('should give another selection another id', () => {
    expect(
      buildExportJobId({ connectionId: CONNECTION_ID, recordIds: ['a'] }),
    ).not.toBe(
      buildExportJobId({ connectionId: CONNECTION_ID, recordIds: ['a', 'b'] }),
    );
  });

  it('should give another connection another id', () => {
    expect(
      buildExportJobId({ connectionId: CONNECTION_ID, recordIds: ['a'] }),
    ).not.toBe(buildExportJobId({ connectionId: 'other', recordIds: ['a'] }));
  });

  it('should leave the record ids out of the id it builds', () => {
    const jobId = buildExportJobId({
      connectionId: CONNECTION_ID,
      recordIds: ['a'],
    });

    expect(jobId).toMatch(/^export-contacts-[0-9a-f]{32}$/);
  });
});
