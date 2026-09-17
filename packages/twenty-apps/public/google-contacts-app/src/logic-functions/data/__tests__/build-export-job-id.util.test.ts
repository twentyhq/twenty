import { describe, expect, it } from 'vitest';

import { buildExportJobId } from 'src/logic-functions/data/build-export-job-id.util';

const CONNECTION_ID = '6f1d2e3a-4b5c-4d6e-8f90-a1b2c3d4e5f6';
const FIRST_UPDATE = '2024-01-01T00:00:00Z';
const SECOND_UPDATE = '2024-01-02T00:00:00Z';

describe('buildExportJobId', () => {
  it('should give the same selection the same id however it is ordered', () => {
    expect(
      buildExportJobId({
        connectionId: CONNECTION_ID,
        people: [
          { id: 'a', updatedAt: FIRST_UPDATE },
          { id: 'b', updatedAt: FIRST_UPDATE },
        ],
      }),
    ).toBe(
      buildExportJobId({
        connectionId: CONNECTION_ID,
        people: [
          { id: 'b', updatedAt: FIRST_UPDATE },
          { id: 'a', updatedAt: FIRST_UPDATE },
        ],
      }),
    );
  });

  it('should give another selection another id', () => {
    expect(
      buildExportJobId({
        connectionId: CONNECTION_ID,
        people: [{ id: 'a', updatedAt: FIRST_UPDATE }],
      }),
    ).not.toBe(
      buildExportJobId({
        connectionId: CONNECTION_ID,
        people: [
          { id: 'a', updatedAt: FIRST_UPDATE },
          { id: 'b', updatedAt: FIRST_UPDATE },
        ],
      }),
    );
  });

  it('should give the same selection another id once a person was edited', () => {
    expect(
      buildExportJobId({
        connectionId: CONNECTION_ID,
        people: [{ id: 'a', updatedAt: FIRST_UPDATE }],
      }),
    ).not.toBe(
      buildExportJobId({
        connectionId: CONNECTION_ID,
        people: [{ id: 'a', updatedAt: SECOND_UPDATE }],
      }),
    );
  });

  it('should give another connection another id', () => {
    expect(
      buildExportJobId({
        connectionId: CONNECTION_ID,
        people: [{ id: 'a', updatedAt: FIRST_UPDATE }],
      }),
    ).not.toBe(
      buildExportJobId({
        connectionId: 'other',
        people: [{ id: 'a', updatedAt: FIRST_UPDATE }],
      }),
    );
  });

  it('should leave the record ids out of the id it builds', () => {
    const jobId = buildExportJobId({
      connectionId: CONNECTION_ID,
      people: [{ id: 'a', updatedAt: FIRST_UPDATE }],
    });

    expect(jobId).toMatch(/^export-contacts-[0-9a-f]{32}$/);
  });
});
