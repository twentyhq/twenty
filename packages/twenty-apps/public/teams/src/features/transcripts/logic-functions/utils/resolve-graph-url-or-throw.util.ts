import { MICROSOFT_GRAPH_BASE_URL } from 'src/features/transcripts/constants/teams.constant';

export const resolveGraphUrlOrThrow = (url: string): string => {
  const resolvedUrl = new URL(url, `${MICROSOFT_GRAPH_BASE_URL}/`);

  if (resolvedUrl.origin !== new URL(MICROSOFT_GRAPH_BASE_URL).origin) {
    throw new Error('Microsoft Graph URLs must use graph.microsoft.com');
  }

  return resolvedUrl.toString();
};
