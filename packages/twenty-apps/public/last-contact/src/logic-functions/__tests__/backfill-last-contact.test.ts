import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

const {
  queryMock,
  enqueueJobsMock,
  scheduleUpcomingPersonMeetingsMock,
  collectPersonMeetingParticipantsMock,
  applyMeetingInteractionsMock,
  backfillPeopleMock,
  recomputeOpportunitiesMock,
  recomputeCompaniesMock,
} = vi.hoisted(() => ({
  queryMock: vi.fn(),
  enqueueJobsMock: vi.fn(),
  scheduleUpcomingPersonMeetingsMock: vi.fn(),
  collectPersonMeetingParticipantsMock: vi.fn(),
  applyMeetingInteractionsMock: vi.fn(),
  backfillPeopleMock: vi.fn(),
  recomputeOpportunitiesMock: vi.fn(),
  recomputeCompaniesMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

vi.mock('src/utils/create-paced-client', () => ({
  createPacedClient: (client: unknown) => client,
}));

vi.mock('src/utils/schedule-meetings', () => ({
  scheduleUpcomingPersonMeetings: scheduleUpcomingPersonMeetingsMock,
}));

vi.mock('src/utils/collect-person-meeting-participants', () => ({
  collectPersonMeetingParticipants: collectPersonMeetingParticipantsMock,
}));

vi.mock('src/utils/apply-meeting-interactions', () => ({
  applyMeetingInteractions: applyMeetingInteractionsMock,
}));

vi.mock('src/utils/backfill-settings', () => ({
  getBackfillBatchSize: () => 2,
}));

vi.mock('src/utils/backfill-people-last-contact', () => ({
  backfillPeopleLastContact: backfillPeopleMock,
}));

vi.mock('src/utils/recompute-opportunity-last-contact', () => ({
  recomputeOpportunitiesLastContact: recomputeOpportunitiesMock,
}));

vi.mock('src/utils/recompute-company-last-contact', () => ({
  recomputeCompaniesLastContact: recomputeCompaniesMock,
}));

import {
  BACKFILL_RATE_LIMITED_RESUME_DELAY_MS,
  BACKFILL_RUN_BUDGET_MS,
} from 'src/constants/backfill';
import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

import backfillLastContact from '../backfill-last-contact';

type ConnectionQuery = Record<
  string,
  { __args: { first: number; after?: string } }
>;

const RECORDS_BY_QUERY_FIELD: Record<string, { id: string }[]> = {
  people: [{ id: 'person-1' }, { id: 'person-2' }, { id: 'person-3' }],
  opportunities: [{ id: 'opportunity-1' }],
  companies: [],
};

const handler = backfillLastContact.config.handler as (
  payload: object,
) => Promise<object>;

let events: string[] = [];

const recordBatch =
  (phase: string) => async (_client: unknown, recordIds: string[]) => {
    await Promise.resolve();
    events.push(`backfilled ${phase} ${recordIds.join(',')}`);
  };

beforeEach(() => {
  events = [];

  enqueueJobsMock.mockReset();
  enqueueJobsMock.mockResolvedValue({ enqueued: true });
  scheduleUpcomingPersonMeetingsMock.mockReset();
  scheduleUpcomingPersonMeetingsMock.mockResolvedValue(undefined);
  collectPersonMeetingParticipantsMock.mockReset();
  collectPersonMeetingParticipantsMock.mockResolvedValue([]);
  applyMeetingInteractionsMock.mockReset();
  applyMeetingInteractionsMock.mockResolvedValue([]);

  queryMock.mockReset();
  queryMock.mockImplementation(async (query: ConnectionQuery) => {
    const [queryField] = Object.keys(query);
    const { first, after } = query[queryField].__args;
    const records = RECORDS_BY_QUERY_FIELD[queryField];
    const start = after === undefined ? 0 : Number(after);
    const page = records.slice(start, start + first);
    const end = start + page.length;

    events.push(`read ${queryField} from ${start}`);

    return {
      [queryField]: {
        edges: page.map((node) => ({ node })),
        pageInfo: { hasNextPage: end < records.length, endCursor: `${end}` },
      },
    };
  });

  backfillPeopleMock.mockReset();
  backfillPeopleMock.mockImplementation(recordBatch('people'));
  recomputeOpportunitiesMock.mockReset();
  recomputeOpportunitiesMock.mockImplementation(recordBatch('opportunities'));
  recomputeCompaniesMock.mockReset();
  recomputeCompaniesMock.mockImplementation(recordBatch('companies'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('backfill-last-contact', () => {
  it('should backfill every batch within the run, one after the other', async () => {
    await expect(handler({ newVersion: '1.6.0' })).resolves.toEqual({
      outcome: 'completed',
      phases: [
        { phase: 'people', count: 3 },
        { phase: 'opportunities', count: 1 },
        { phase: 'companies', count: 0 },
      ],
    });

    expect(events).toEqual([
      'read people from 0',
      'backfilled people person-1,person-2',
      'read people from 2',
      'backfilled people person-3',
      'read opportunities from 0',
      'backfilled opportunities opportunity-1',
      'read companies from 0',
    ]);
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it.each(['1.4.1', '1.5.0'])(
    'should backfill on an upgrade from %s to 1.6.0',
    async (previousVersion) => {
      await expect(
        handler({ previousVersion, newVersion: '1.6.0' }),
      ).resolves.toMatchObject({ outcome: 'completed' });
    },
  );

  it('should skip the backfill on an upgrade from 1.6.0', async () => {
    await expect(
      handler({ previousVersion: '1.6.0', newVersion: '1.6.1' }),
    ).resolves.toEqual({});

    expect(queryMock).not.toHaveBeenCalled();
  });

  it('should schedule upcoming meetings and apply the last hour of meetings on every upgrade', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-12T12:00:00.000Z'));

    await handler({ previousVersion: '1.7.0', newVersion: '1.8.0' });

    expect(scheduleUpcomingPersonMeetingsMock).toHaveBeenCalledTimes(1);
    expect(collectPersonMeetingParticipantsMock).toHaveBeenCalledWith(
      expect.anything(),
      {
        from: new Date('2026-06-12T11:00:00.000Z'),
        to: new Date('2026-06-12T12:00:00.000Z'),
      },
    );
    expect(applyMeetingInteractionsMock).toHaveBeenCalledTimes(1);
  });

  it('should hand the rest of the backfill to a new run once the run budget is spent', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-12T12:00:00.000Z'));
    backfillPeopleMock.mockImplementationOnce(async (_client, recordIds) => {
      await recordBatch('people')(_client, recordIds);
      vi.setSystemTime(Date.now() + BACKFILL_RUN_BUDGET_MS);
    });

    await expect(handler({ newVersion: '1.6.0' })).resolves.toEqual({
      outcome: 'paused',
      phases: [{ phase: 'people', count: 2 }],
      resumeFrom: { phase: 'people', after: '2' },
    });

    expect(events).toEqual([
      'read people from 0',
      'backfilled people person-1,person-2',
    ]);
    expect(enqueueJobsMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: [{ payload: { resumeFrom: { phase: 'people', after: '2' } } }],
    });
  });

  it('should resume from the cursor without scheduling meetings again', async () => {
    await expect(
      handler({ resumeFrom: { phase: 'people', after: '2' } }),
    ).resolves.toMatchObject({ outcome: 'completed' });

    expect(events).toEqual([
      'read people from 2',
      'backfilled people person-3',
      'read opportunities from 0',
      'backfilled opportunities opportunity-1',
      'read companies from 0',
    ]);
    expect(scheduleUpcomingPersonMeetingsMock).not.toHaveBeenCalled();
    expect(applyMeetingInteractionsMock).not.toHaveBeenCalled();
  });

  it('should resume a later phase from its start', async () => {
    await handler({ resumeFrom: { phase: 'opportunities' } });

    expect(events).toEqual([
      'read opportunities from 0',
      'backfilled opportunities opportunity-1',
      'read companies from 0',
    ]);
  });

  it('should redo the rate-limited batch in a delayed run instead of restarting the backfill', async () => {
    backfillPeopleMock
      .mockImplementationOnce(recordBatch('people'))
      .mockRejectedValueOnce(new RetryableLogicFunctionError('Rate limited'));

    await expect(handler({ newVersion: '1.6.0' })).resolves.toEqual({
      outcome: 'paused',
      phases: [{ phase: 'people', count: 2 }],
      resumeFrom: { phase: 'people', after: '2' },
    });

    expect(enqueueJobsMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: [{ payload: { resumeFrom: { phase: 'people', after: '2' } } }],
      delayMs: BACKFILL_RATE_LIMITED_RESUME_DELAY_MS,
    });
  });

  it('should fail the run on errors that are not rate limits', async () => {
    backfillPeopleMock.mockRejectedValueOnce(new Error('Bad Request'));

    await expect(handler({ newVersion: '1.6.0' })).rejects.toThrow(
      'Bad Request',
    );
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });
});
