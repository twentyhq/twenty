import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkCreditsBeforeRecallBotJoin } from 'src/logic-functions/flows/check-credits-before-recall-bot-join.util';

const getCreditAvailabilityMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/billing', () => ({
  getCreditAvailability: getCreditAvailabilityMock,
}));

const fetchMock = vi.fn();

const MEETING_STARTS_AT = '2026-01-01T13:00:00.000Z';
const JOIN_AT = '2026-01-01T12:59:00.000Z';
const TEN_MINUTES_BEFORE_JOIN = new Date('2026-01-01T12:49:00.000Z');
const RECALL_BOT_URL = 'https://us-west-2.recall.ai/api/v1/bot/recall-bot-1/';

type CallRecordingNode = {
  id: string;
  status: string;
  recordingRequestStatus: string;
  calendarEventId: string | null;
  externalBotId: string | null;
  botScheduleAttemptedAt?: string | null;
  botScheduleIdempotencyKey?: string | null;
  callRecorderFailureReason?: string | null;
};

const buildConnection = <TNode>(nodes: TNode[]) => ({
  pageInfo: { hasNextPage: false, endCursor: undefined },
  edges: nodes.map((node) => ({ node })),
});

class FakeCoreApiClient {
  callRecording: CallRecordingNode;
  meetingStartsAt: string | null;

  constructor({
    callRecording = {},
    meetingStartsAt = MEETING_STARTS_AT,
  }: {
    callRecording?: Partial<CallRecordingNode>;
    meetingStartsAt?: string | null;
  } = {}) {
    this.callRecording = {
      id: 'call-recording-1',
      status: 'SCHEDULED',
      recordingRequestStatus: 'REQUESTED',
      calendarEventId: 'calendar-event-1',
      externalBotId: 'recall-bot-1',
      botScheduleAttemptedAt: '2026-01-01T08:00:00.000Z',
      botScheduleIdempotencyKey: 'idempotency-key',
      ...callRecording,
    };
    this.meetingStartsAt = meetingStartsAt;
  }

  async query(query: any): Promise<any> {
    if (query.callRecordings !== undefined) {
      return { callRecordings: buildConnection([this.callRecording]) };
    }

    if (query.calendarEvents !== undefined) {
      return {
        calendarEvents: buildConnection([
          {
            id: 'calendar-event-1',
            startsAt: this.meetingStartsAt,
            endsAt: '2026-01-01T14:00:00.000Z',
            conferenceLink: {
              primaryLinkUrl: 'https://meet.example.com/customer-sync',
            },
          },
        ]),
      };
    }

    throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
  }

  async mutation(mutation: any): Promise<any> {
    if (mutation.updateCallRecordings !== undefined) {
      const { filter, data } = mutation.updateCallRecordings.__args;
      const isMatch =
        filter.id.eq === this.callRecording.id &&
        filter.status.in.includes(this.callRecording.status);

      if (isMatch) {
        Object.assign(this.callRecording, data);
      }

      return {
        updateCallRecordings: isMatch ? [{ id: this.callRecording.id }] : [],
      };
    }

    if (mutation.updateCallRecording !== undefined) {
      Object.assign(
        this.callRecording,
        mutation.updateCallRecording.__args.data,
      );

      return { updateCallRecording: { id: this.callRecording.id } };
    }

    throw new Error(`Unhandled mutation: ${JSON.stringify(mutation)}`);
  }
}

const checkCredits = ({
  client,
  now,
}: {
  client: FakeCoreApiClient;
  now: Date;
}) =>
  checkCreditsBeforeRecallBotJoin({
    client: client as unknown as CoreApiClient,
    callRecordingId: 'call-recording-1',
    now,
  });

const stubRecallBotRemoval = (status: number) => {
  fetchMock.mockImplementation(async () => new Response(null, { status }));
};

describe('checkCreditsBeforeRecallBotJoin', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    fetchMock.mockReset();
    getCreditAvailabilityMock.mockReset();
    stubRecallBotRemoval(204);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('leaves the bot alone when the workspace has credits', async () => {
    getCreditAvailabilityMock.mockResolvedValue({ hasAvailableCredits: true });
    const client = new FakeCoreApiClient();

    const result = await checkCredits({ client, now: TEN_MINUTES_BEFORE_JOIN });

    expect(result).toEqual({ status: 'allowed' });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.callRecording.status).toBe('SCHEDULED');
    expect(client.callRecording.externalBotId).toBe('recall-bot-1');
  });

  it('cancels the bot and marks the recording not recorded when the workspace is out of credits', async () => {
    getCreditAvailabilityMock.mockResolvedValue({
      hasAvailableCredits: false,
      reason: 'no-credits',
    });
    const client = new FakeCoreApiClient();

    const result = await checkCredits({ client, now: TEN_MINUTES_BEFORE_JOIN });

    expect(result).toEqual({
      status: 'blocked',
      failureReason: 'workspace_out_of_credits',
    });
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      RECALL_BOT_URL,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(client.callRecording).toMatchObject({
      status: 'NOT_RECORDED',
      callRecorderFailureReason: 'workspace_out_of_credits',
      externalBotId: null,
      botScheduleAttemptedAt: null,
      botScheduleIdempotencyKey: null,
    });
  });

  it.each([
    ['no-subscription', 'workspace_without_subscription'],
    ['workspace-suspended', 'workspace_suspended'],
  ])(
    'blocks the recording when the verdict is %s',
    async (reason, failureReason) => {
      getCreditAvailabilityMock.mockResolvedValue({
        hasAvailableCredits: false,
        reason,
      });
      const client = new FakeCoreApiClient();

      const result = await checkCredits({
        client,
        now: TEN_MINUTES_BEFORE_JOIN,
      });

      expect(result).toEqual({ status: 'blocked', failureReason });
      expect(client.callRecording.callRecorderFailureReason).toBe(
        failureReason,
      );
    },
  );

  it('never reads the verdict for a call that is already being recorded', async () => {
    const client = new FakeCoreApiClient({
      callRecording: { status: 'RECORDING' },
    });

    const result = await checkCredits({ client, now: TEN_MINUTES_BEFORE_JOIN });

    expect(result.status).toBe('skipped');
    expect(getCreditAvailabilityMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.callRecording.status).toBe('RECORDING');
  });

  it('does nothing once the bot join time has passed', async () => {
    const client = new FakeCoreApiClient();

    const result = await checkCredits({ client, now: new Date(JOIN_AT) });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'bot join time has passed',
    });
    expect(getCreditAvailabilityMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reads the join time from the calendar event, not from when the job was enqueued', async () => {
    getCreditAvailabilityMock.mockResolvedValue({
      hasAvailableCredits: false,
      reason: 'no-credits',
    });
    const client = new FakeCoreApiClient({
      meetingStartsAt: '2026-01-01T12:45:00.000Z',
    });

    const result = await checkCredits({ client, now: TEN_MINUTES_BEFORE_JOIN });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'bot join time has passed',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does nothing when the meeting has no start time', async () => {
    const client = new FakeCoreApiClient({ meetingStartsAt: null });

    const result = await checkCredits({ client, now: TEN_MINUTES_BEFORE_JOIN });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'meeting has no start time',
    });
    expect(getCreditAvailabilityMock).not.toHaveBeenCalled();
  });

  it('throws and keeps the recording scheduled when Recall refuses the cancellation', async () => {
    getCreditAvailabilityMock.mockResolvedValue({
      hasAvailableCredits: false,
      reason: 'no-credits',
    });
    stubRecallBotRemoval(403);
    const client = new FakeCoreApiClient();

    await expect(
      checkCredits({ client, now: TEN_MINUTES_BEFORE_JOIN }),
    ).rejects.toThrow('could not be canceled');

    expect(client.callRecording.status).toBe('SCHEDULED');
    expect(client.callRecording.externalBotId).toBe('recall-bot-1');
  });

  it('leaves a bot that has already joined alone instead of ejecting it', async () => {
    getCreditAvailabilityMock.mockResolvedValue({
      hasAvailableCredits: false,
      reason: 'no-credits',
    });
    stubRecallBotRemoval(405);
    const client = new FakeCoreApiClient();

    const result = await checkCredits({ client, now: TEN_MINUTES_BEFORE_JOIN });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'bot has already joined',
    });
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      RECALL_BOT_URL,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(client.callRecording.status).toBe('SCHEDULED');
    expect(client.callRecording.externalBotId).toBe('recall-bot-1');
  });

  it('does nothing for the canceled recording of a meeting that moved', async () => {
    const client = new FakeCoreApiClient({
      callRecording: {
        recordingRequestStatus: 'CANCELED',
        externalBotId: null,
      },
    });

    const result = await checkCredits({ client, now: TEN_MINUTES_BEFORE_JOIN });

    expect(result.status).toBe('skipped');
    expect(getCreditAvailabilityMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('treats a bot that is already gone as canceled so a retried job completes', async () => {
    getCreditAvailabilityMock.mockResolvedValue({
      hasAvailableCredits: false,
      reason: 'no-credits',
    });
    stubRecallBotRemoval(404);
    const client = new FakeCoreApiClient();

    const result = await checkCredits({ client, now: TEN_MINUTES_BEFORE_JOIN });

    expect(result.status).toBe('blocked');
    expect(client.callRecording.status).toBe('NOT_RECORDED');
  });

  it('leaves a terminal status untouched when it changed while the bot was being canceled', async () => {
    getCreditAvailabilityMock.mockResolvedValue({
      hasAvailableCredits: false,
      reason: 'no-credits',
    });
    const client = new FakeCoreApiClient();
    fetchMock.mockImplementation(async () => {
      client.callRecording.status = 'FAILED';

      return new Response(null, { status: 204 });
    });

    await checkCredits({ client, now: TEN_MINUTES_BEFORE_JOIN });

    expect(client.callRecording.status).toBe('FAILED');
    expect(client.callRecording.callRecorderFailureReason).toBeUndefined();
  });
});
