import { http, HttpResponse, type RequestHandler } from 'msw';
import { isDefined } from 'twenty-sdk/utils';

import { type FakeGraphFailure } from 'src/__tests__/types/fake-graph-failure.type';
import { type FakeTeamsCalendarEvent } from 'src/__tests__/types/fake-teams-calendar-event.type';
import { type FakeTeamsMeeting } from 'src/__tests__/types/fake-teams-meeting.type';
import { type GraphApiCall } from 'src/__tests__/types/graph-api-call.type';
import { type GraphApiMock } from 'src/__tests__/types/graph-api-mock.type';
import { MICROSOFT_GRAPH_BASE_URL } from 'src/constants/teams.constant';

const DEFAULT_ACCESS_TOKEN = 'graph-delegated-test-token';
const DEFAULT_PAGE_SIZE = 50;

const graphError = ({
  status,
  code,
  message,
  innerErrorCode,
}: {
  status: number;
  code: string;
  message: string;
  innerErrorCode?: string;
}) =>
  HttpResponse.json(
    {
      error: {
        code,
        message,
        ...(isDefined(innerErrorCode)
          ? { innerError: { code: innerErrorCode } }
          : {}),
      },
    },
    { status },
  );

const paginate = <TItem>({
  items,
  requestUrl,
  pageSize,
}: {
  items: TItem[];
  requestUrl: string;
  pageSize: number;
}) => {
  const url = new URL(requestUrl);
  const skip = Number(url.searchParams.get('$skip') ?? 0);
  const nextSkip = skip + pageSize;
  const nextUrl = new URL(url);

  nextUrl.searchParams.set('$skip', String(nextSkip));

  return HttpResponse.json({
    value: items.slice(skip, nextSkip),
    ...(nextSkip < items.length
      ? { '@odata.nextLink': nextUrl.toString() }
      : {}),
  });
};

const toGraphCalendarEvent = (
  event: FakeTeamsCalendarEvent,
  selectedFields: string[],
) => ({
  isOrganizer: event.isOrganizer ?? true,
  isCancelled: event.isCancelled ?? false,
  ...(selectedFields.includes('isOnlineMeeting')
    ? {
        isOnlineMeeting: true,
        onlineMeetingProvider:
          event.onlineMeetingProvider ?? 'teamsForBusiness',
        onlineMeeting: { joinUrl: event.joinUrl },
      }
    : { onlineMeetingProvider: 'unknown', onlineMeeting: null }),
});

const readSelectedFields = (requestUrl: string): string[] =>
  (new URL(requestUrl).searchParams.get('$select') ?? '').split(',');

const readJoinWebUrlFilter = (requestUrl: string): string | undefined => {
  const filter = new URL(requestUrl).searchParams.get('$filter') ?? '';
  const match = /^JoinWebUrl eq '(.*)'$/.exec(filter);

  return match?.[1].replace(/''/g, "'");
};

export const createGraphApiMock = ({
  accessToken = DEFAULT_ACCESS_TOKEN,
}: { accessToken?: string } = {}): GraphApiMock => {
  const buildInitialState = () => ({
    calendarEvents: [] as FakeTeamsCalendarEvent[],
    meetings: [] as FakeTeamsMeeting[],
    calls: [] as GraphApiCall[],
    calendarPageSize: DEFAULT_PAGE_SIZE,
    transcriptPageSize: DEFAULT_PAGE_SIZE,
    pendingFailure: undefined as FakeGraphFailure | undefined,
  });
  const state = buildInitialState();

  const handlers: RequestHandler[] = [
    http.all(`${MICROSOFT_GRAPH_BASE_URL}/*`, ({ request }) => {
      const authorization = request.headers.get('Authorization');

      state.calls.push({
        method: request.method,
        url: request.url,
        authorization,
      });

      if (authorization !== `Bearer ${accessToken}`) {
        return graphError({
          status: 401,
          code: 'InvalidAuthenticationToken',
          message: 'Access token is empty or invalid.',
        });
      }

      if (isDefined(state.pendingFailure)) {
        const { status, body, headers } = state.pendingFailure;

        state.pendingFailure = undefined;

        return HttpResponse.json(body ?? {}, { status, headers });
      }

      return undefined;
    }),
    http.get(`${MICROSOFT_GRAPH_BASE_URL}/me/calendarView`, ({ request }) =>
      paginate({
        items: state.calendarEvents.map((event) =>
          toGraphCalendarEvent(event, readSelectedFields(request.url)),
        ),
        requestUrl: request.url,
        pageSize: state.calendarPageSize,
      }),
    ),
    http.get(`${MICROSOFT_GRAPH_BASE_URL}/me/onlineMeetings`, ({ request }) => {
      const joinWebUrl = readJoinWebUrlFilter(request.url);
      const meeting = state.meetings.find(
        (candidate) => candidate.joinWebUrl === joinWebUrl,
      );

      return HttpResponse.json({
        value: !isDefined(meeting)
          ? []
          : [
              {
                id: meeting.id,
                subject: meeting.subject ?? null,
                joinWebUrl: meeting.joinWebUrl,
              },
            ],
      });
    }),
    http.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/onlineMeetings/:meetingId/transcripts`,
      ({ request, params }) => {
        const meeting = state.meetings.find(
          (candidate) => candidate.id === params.meetingId,
        );

        if (!isDefined(meeting)) {
          return graphError({
            status: 404,
            code: 'NotFound',
            message: 'Online meeting not found.',
          });
        }

        return paginate({
          items: meeting.transcripts.map((transcript) => ({
            id: transcript.id,
            meetingId: meeting.id,
            createdDateTime: transcript.createdDateTime ?? null,
          })),
          requestUrl: request.url,
          pageSize: state.transcriptPageSize,
        });
      },
    ),
  ];

  return {
    accessToken,
    handlers,

    get calls(): GraphApiCall[] {
      return state.calls;
    },

    callsTo: (path: string): GraphApiCall[] =>
      state.calls.filter(
        (call) => new URL(call.url).pathname === `/v1.0${path}`,
      ),

    addCalendarEvent: (event: FakeTeamsCalendarEvent): void => {
      state.calendarEvents.push(event);
    },

    addMeeting: (meeting: FakeTeamsMeeting): void => {
      state.meetings.push(meeting);
    },

    setCalendarPageSize: (pageSize: number): void => {
      state.calendarPageSize = pageSize;
    },

    setTranscriptPageSize: (pageSize: number): void => {
      state.transcriptPageSize = pageSize;
    },

    failNextCall: (failure: FakeGraphFailure): void => {
      state.pendingFailure = failure;
    },

    reset: (): void => {
      Object.assign(state, buildInitialState());
    },
  };
};
