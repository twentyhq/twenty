import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildListedTranscript,
  FIREFLIES_API_KEY,
  FIREFLIES_BACKFILL_FROM_DATE,
  FIREFLIES_BACKFILL_TO_DATE,
  getListRequestVariables,
  serveFirefliesApi,
} from 'src/logic-functions/flows/__tests__/import-missing-fireflies-calls.test-support';
import { FIREFLIES_BACKFILL_PAGE_SIZE } from 'src/logic-functions/constants/fireflies-backfill-page-size.constant';
import { listFirefliesTranscriptIds } from 'src/logic-functions/utils/list-fireflies-transcript-ids.util';

vi.mock(
  'src/logic-functions/constants/fireflies-backfill-max-page-count.constant',
  () => ({ FIREFLIES_BACKFILL_MAX_PAGE_COUNT: 2 }),
);

const fetchMock = vi.fn();

const buildFullPage = (pageIndex: number) =>
  Array.from({ length: FIREFLIES_BACKFILL_PAGE_SIZE }, (_, callIndex) =>
    buildListedTranscript(
      `call-${pageIndex}-${callIndex}`,
      Date.parse('2026-06-02T10:00:00.000Z'),
    ),
  );

describe('listFirefliesTranscriptIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('collects every transcript id across pages', async () => {
    const shortPage = [
      buildListedTranscript(
        'call-last',
        Date.parse('2026-06-01T10:00:00.000Z'),
      ),
    ];

    serveFirefliesApi([buildFullPage(0), shortPage], fetchMock);

    const result = await listFirefliesTranscriptIds({
      apiKey: FIREFLIES_API_KEY,
      fromDate: FIREFLIES_BACKFILL_FROM_DATE,
      toDate: FIREFLIES_BACKFILL_TO_DATE,
    });

    expect(result).toEqual({
      ok: true,
      transcriptIds: [...buildFullPage(0).map(({ id }) => id), 'call-last'],
    });
    expect(getListRequestVariables(fetchMock)).toEqual([
      expect.objectContaining({ skip: 0 }),
      expect.objectContaining({ skip: FIREFLIES_BACKFILL_PAGE_SIZE }),
    ]);
  });

  it('stops at an empty first page', async () => {
    serveFirefliesApi([[]], fetchMock);

    const result = await listFirefliesTranscriptIds({
      apiKey: FIREFLIES_API_KEY,
      fromDate: FIREFLIES_BACKFILL_FROM_DATE,
      toDate: FIREFLIES_BACKFILL_TO_DATE,
    });

    expect(result).toEqual({ ok: true, transcriptIds: [] });
    expect(getListRequestVariables(fetchMock)).toHaveLength(1);
  });

  it('propagates a Fireflies listing failure', async () => {
    fetchMock.mockResolvedValue(
      new Response('invalid request', { status: 400 }),
    );

    const result = await listFirefliesTranscriptIds({
      apiKey: FIREFLIES_API_KEY,
      fromDate: FIREFLIES_BACKFILL_FROM_DATE,
      toDate: FIREFLIES_BACKFILL_TO_DATE,
    });

    expect(result).toEqual(expect.objectContaining({ ok: false, status: 400 }));
  });

  it('fails after the bounded number of full pages', async () => {
    serveFirefliesApi([buildFullPage(0), buildFullPage(1)], fetchMock);

    const result = await listFirefliesTranscriptIds({
      apiKey: FIREFLIES_API_KEY,
      fromDate: FIREFLIES_BACKFILL_FROM_DATE,
      toDate: FIREFLIES_BACKFILL_TO_DATE,
    });

    expect(result).toEqual({
      ok: false,
      status: 0,
      errorMessage: 'Fireflies backfill listing exceeded 2 pages',
    });
    expect(getListRequestVariables(fetchMock)).toHaveLength(2);
  });
});
