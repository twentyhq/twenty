import { resolveGraphUrlOrThrow } from 'src/features/transcripts/logic-functions/utils/resolve-graph-url-or-throw';

export const resolveTeamsCalendarNextPageUrlOrThrow = (
  nextPageUrl: string,
): string => {
  const url = resolveGraphUrlOrThrow(nextPageUrl);
  const { pathname } = new URL(url);

  if (
    pathname !== '/v1.0/me/calendarView' &&
    pathname !== '/v1.0/me/calendarView/'
  ) {
    throw new Error(
      'Teams calendar pagination URLs must use /v1.0/me/calendarView',
    );
  }

  return url;
};
