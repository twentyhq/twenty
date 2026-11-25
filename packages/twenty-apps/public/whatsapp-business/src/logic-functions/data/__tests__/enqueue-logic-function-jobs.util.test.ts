import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enqueueJobs } from 'twenty-sdk/logic-function';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';

vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs: vi.fn() }));

describe('enqueueLogicFunctionJobs', () => {
  beforeEach(() => {
    vi.mocked(enqueueJobs).mockReset();
  });

  it('should enqueue at most 200 jobs per call', async () => {
    await enqueueLogicFunctionJobs({
      logicFunctionUniversalIdentifier: 'logic-function-id',
      payloads: Array.from({ length: 450 }, (_, index) => ({ index })),
      getJobKey: ({ index }) => String(index),
    });

    expect(vi.mocked(enqueueJobs).mock.calls.map(([input]) => input.jobs?.length)).toEqual([200, 200, 50]);
  });

  it('should enqueue a duplicate delivery once, with a valid job id', async () => {
    await enqueueLogicFunctionJobs({
      logicFunctionUniversalIdentifier: 'logic-function-id',
      payloads: [{ id: 'wamid.HBgLMTY1MDU1NTEyMzQVAgARGBI=' }, { id: 'wamid.HBgLMTY1MDU1NTEyMzQVAgARGBI=' }],
      getJobKey: ({ id }) => id,
    });

    const jobs = vi.mocked(enqueueJobs).mock.calls[0]?.[0].jobs ?? [];

    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.jobId).toMatch(/^[\w.-]{1,128}$/);
  });

  it('should not call enqueueJobs without payloads', async () => {
    await enqueueLogicFunctionJobs({
      logicFunctionUniversalIdentifier: 'logic-function-id',
      payloads: [],
      getJobKey: () => 'key',
    });

    expect(enqueueJobs).not.toHaveBeenCalled();
  });
});
