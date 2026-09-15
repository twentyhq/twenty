import { describe, expect, it } from 'vitest';

import { getGranolaJobId } from 'src/logic-functions/utils/get-granola-job-id.util';

describe('getGranolaJobId', () => {
  it('derives the same queue-safe identifier for the same job identity', () => {
    const identity = {
      registrationId: 'reg-1',
      folderId: 'fol_2mKr8fQxLp7Ta3',
      createdAfter: '2026-09-05T10:00:00+05:30',
      pageIndex: 0,
    };

    const jobId = getGranolaJobId({ prefix: 'granola-discovery', identity });

    expect(jobId).toBe(
      getGranolaJobId({ prefix: 'granola-discovery', identity }),
    );
    expect(jobId).toMatch(/^[\w.-]+$/);
    expect(jobId.length).toBeLessThanOrEqual(128);
  });

  it('separates jobs that import different notes', () => {
    const first = getGranolaJobId({
      prefix: 'granola-note',
      identity: { registrationId: 'reg-1', noteId: 'not_a' },
    });
    const second = getGranolaJobId({
      prefix: 'granola-note',
      identity: { registrationId: 'reg-1', noteId: 'not_b' },
    });

    expect(first).not.toBe(second);
  });
});
