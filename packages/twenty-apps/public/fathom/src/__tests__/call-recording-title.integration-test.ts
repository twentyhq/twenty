import { randomUUID } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renameFathomCallRecording } from 'src/logic-functions/utils/rename-fathom-call-recording.util';

const runAgentMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({ runAgent: runAgentMock }));

const EXPECTED_TITLE = 'Impromptu Zoom Meeting (17 Sept 2026, 14:30 UTC)';
const GENERATED_TITLE = 'Impromptu Zoom Meeting (Acme onboarding next steps)';
const AGENT_RESULT = {
  success: true,
  result: { response: 'Acme onboarding next steps' },
};
const TITLE_CONTEXT = {
  expectedTitle: EXPECTED_TITLE,
  originalTitle: 'Impromptu Zoom Meeting',
  summary: 'Custom notes about Acme onboarding blockers and next steps.',
};
const createdRecordingIds: string[] = [];
const coreApiClient = new CoreApiClient();

const createRecording = async () => {
  const callRecordingId = randomUUID();

  await coreApiClient.mutation({
    createCallRecording: {
      __args: { data: { id: callRecordingId, title: EXPECTED_TITLE } },
      id: true,
    },
  });
  createdRecordingIds.push(callRecordingId);

  return { callRecordingId, ...TITLE_CONTEXT };
};

const readTitle = async (callRecordingId: string) => {
  const result = await coreApiClient.query({
    callRecording: {
      __args: { filter: { id: { eq: callRecordingId } } },
      title: true,
    },
  });

  return result.callRecording?.title;
};

const editTitle = async ({
  callRecordingId,
  title,
}: {
  callRecordingId: string;
  title: string;
}) =>
  coreApiClient.mutation({
    updateCallRecording: {
      __args: { id: callRecordingId, data: { title } },
      id: true,
    },
  });

beforeEach(() => {
  vi.resetAllMocks();
  runAgentMock.mockResolvedValue(AGENT_RESULT);
});

afterEach(async () => {
  for (const callRecordingId of createdRecordingIds.splice(0)) {
    await coreApiClient.mutation({
      destroyCallRecording: {
        __args: { id: callRecordingId },
        id: true,
      },
    });
  }
});

describe('Fathom background recording titles', () => {
  it('renames a timestamped recording once and skips repeated execution', async () => {
    const payload = await createRecording();

    expect(await renameFathomCallRecording({ coreApiClient, payload })).toEqual(
      {
        renamed: true,
      },
    );
    expect(await readTitle(payload.callRecordingId)).toBe(GENERATED_TITLE);
    expect(await renameFathomCallRecording({ coreApiClient, payload })).toEqual(
      {
        renamed: false,
      },
    );
    expect(runAgentMock).toHaveBeenCalledTimes(1);
  });

  it('skips generation when the title was already changed', async () => {
    const payload = await createRecording();

    await editTitle({ ...payload, title: 'My customer follow-up' });

    expect(await renameFathomCallRecording({ coreApiClient, payload })).toEqual(
      {
        renamed: false,
      },
    );
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(await readTitle(payload.callRecordingId)).toBe(
      'My customer follow-up',
    );
  });

  it('allows only one concurrent worker to replace the timestamped title', async () => {
    const payload = await createRecording();
    const completeAgentRuns: (() => void)[] = [];

    runAgentMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          completeAgentRuns.push(() => resolve(AGENT_RESULT));

          if (completeAgentRuns.length === 2) {
            completeAgentRuns.forEach((completeAgentRun) => completeAgentRun());
          }
        }),
    );

    const results = await Promise.all([
      renameFathomCallRecording({ coreApiClient, payload }),
      renameFathomCallRecording({ coreApiClient, payload }),
    ]);

    expect(results.filter((result) => result.renamed)).toHaveLength(1);
    expect(await readTitle(payload.callRecordingId)).toBe(GENERATED_TITLE);
  });

  it('preserves a user rename made while generation is running', async () => {
    const payload = await createRecording();

    runAgentMock.mockImplementationOnce(async () => {
      await editTitle({ ...payload, title: 'My customer follow-up' });

      return AGENT_RESULT;
    });

    expect(await renameFathomCallRecording({ coreApiClient, payload })).toEqual(
      {
        renamed: false,
      },
    );
    expect(runAgentMock).toHaveBeenCalledTimes(1);
    expect(await readTitle(payload.callRecordingId)).toBe(
      'My customer follow-up',
    );
  });

  it('allows unrelated record updates during generation', async () => {
    const payload = await createRecording();

    runAgentMock.mockImplementationOnce(async () => {
      await coreApiClient.mutation({
        updateCallRecording: {
          __args: {
            id: payload.callRecordingId,
            data: { summary: { markdown: 'Updated summary', blocknote: null } },
          },
          id: true,
        },
      });

      return AGENT_RESULT;
    });

    expect(await renameFathomCallRecording({ coreApiClient, payload })).toEqual(
      {
        renamed: true,
      },
    );
    expect(await readTitle(payload.callRecordingId)).toBe(GENERATED_TITLE);
  });

  it.each([
    { success: false, result: null, error: 'Insufficient credits' },
    { success: true, result: { response: 'NO_TOPIC' } },
  ])('keeps the saved timestamp when the agent returns %j', async (result) => {
    const payload = await createRecording();

    runAgentMock.mockResolvedValueOnce(result);

    expect(await renameFathomCallRecording({ coreApiClient, payload })).toEqual(
      {
        renamed: false,
      },
    );
    expect(await readTitle(payload.callRecordingId)).toBe(EXPECTED_TITLE);
  });

  it('keeps the saved timestamp when the agent request fails', async () => {
    const payload = await createRecording();

    runAgentMock.mockRejectedValueOnce(new Error('Service unavailable'));

    expect(await renameFathomCallRecording({ coreApiClient, payload })).toEqual(
      {
        renamed: false,
      },
    );
    expect(await readTitle(payload.callRecordingId)).toBe(EXPECTED_TITLE);
  });

  it('skips generation when the recording no longer exists', async () => {
    const payload = { callRecordingId: randomUUID(), ...TITLE_CONTEXT };

    expect(await renameFathomCallRecording({ coreApiClient, payload })).toEqual(
      {
        renamed: false,
      },
    );
    expect(runAgentMock).not.toHaveBeenCalled();
  });
});
