import { type Mock, vi } from 'vitest';

export const FIREFLIES_API_KEY = 'fireflies-api-key';
export const FIREFLIES_BACKFILL_FROM_DATE = '2026-05-01T00:00:00.000Z';
export const FIREFLIES_BACKFILL_TO_DATE = '2026-07-30T00:00:00.000Z';

export const skipSleep = async (): Promise<void> => {};

type RawListedTranscript = {
  id: string;
  title: string;
  date: number;
  duration: number;
  participants: string[];
  host_email: string | null;
  transcript_url: string | null;
  meeting_link: string | null;
};

export const buildListedTranscript = (
  id: string,
  dateMilliseconds: number,
): RawListedTranscript => ({
  id,
  title: `Call ${id}`,
  date: dateMilliseconds,
  duration: 30,
  participants: ['a@example.com'],
  host_email: 'a@example.com',
  transcript_url: null,
  meeting_link: null,
});

export const buildGraphqlResponse = (data: object): Response =>
  new Response(JSON.stringify({ data }), { status: 200 });

export const serveFirefliesApi = (
  pages: RawListedTranscript[][],
  fetchMock: Mock,
) => {
  let listRequestIndex = 0;

  fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body)) as {
      query: string;
      variables?: { transcriptId?: string };
    };

    if (body.query.includes('query Transcripts(')) {
      const page = pages[listRequestIndex] ?? [];

      listRequestIndex += 1;

      return buildGraphqlResponse({ transcripts: page });
    }

    return buildGraphqlResponse({
      transcript: {
        id: body.variables?.transcriptId ?? 'detail',
        title: 'Call detail',
        date: Date.parse(FIREFLIES_BACKFILL_FROM_DATE),
        duration: 30,
        meeting_link: null,
        participants: ['a@example.com'],
        organizer_email: 'a@example.com',
        calendar_id: null,
        cal_id: null,
        calendar_type: null,
        sentences: [
          {
            speaker_name: 'A',
            text: 'hello',
            start_time: 0,
            end_time: 1,
          },
        ],
        summary: null,
      },
    });
  });
};

type StoredCallRecording = {
  id: string;
  status?: string;
  transcript?: unknown;
  summary?: { markdown: string } | null;
};

export const answerTwentyQueries = ({
  queryMock,
  callRecordings = [],
}: {
  queryMock: Mock;
  callRecordings?: StoredCallRecording[];
}) => {
  queryMock.mockImplementation(
    async (query: {
      callRecordings?: {
        __args?: {
          filter?: {
            id?: { in?: string[]; eq?: string };
          };
        };
      };
    }) => {
      const idFilter = query.callRecordings?.__args?.filter?.id;

      if (Array.isArray(idFilter?.in)) {
        return {
          callRecordings: {
            edges: callRecordings
              .filter(({ id }) => idFilter.in?.includes(id))
              .map((node) => ({ node })),
          },
        };
      }

      if (idFilter?.eq) {
        const callRecording = callRecordings.find(
          ({ id }) => id === idFilter.eq,
        );

        return {
          callRecordings: {
            edges: callRecording ? [{ node: callRecording }] : [],
          },
        };
      }

      return {
        calendarChannelEventAssociations: { edges: [] },
        calendarEvents: { edges: [] },
      };
    },
  );
};

export const getListRequestVariables = (
  fetchMock: Mock,
): Array<{
  fromDate?: string;
  skip?: number;
  toDate?: string;
}> =>
  fetchMock.mock.calls
    .map(([, init]) => JSON.parse(String((init as RequestInit).body)))
    .filter((body: { query: string }) =>
      body.query.includes('query Transcripts('),
    )
    .map(
      (body: { variables: { skip?: number; toDate?: string } }) =>
        body.variables,
    );

export const setUpImportMissingFirefliesCallsTest = ({
  fetchMock,
  queryMock,
  mutationMock,
}: {
  fetchMock: Mock;
  queryMock: Mock;
  mutationMock: Mock;
}) => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', fetchMock);
  answerTwentyQueries({ queryMock });
  mutationMock.mockResolvedValue({
    createCallRecording: { id: 'created' },
  });
};
