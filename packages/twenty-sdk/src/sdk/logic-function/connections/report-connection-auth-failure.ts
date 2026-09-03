import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const REPORT_APP_CONNECTION_AUTH_FAILURE_MUTATION = `
  mutation ReportAppConnectionAuthFailure($input: ReportAppConnectionAuthFailureInput!) {
    reportAppConnectionAuthFailure(input: $input)
  }
`;

// Marks one of the app's connections as auth-failed (`authFailedAt`), with an
// optional human-readable reason shown on the connection row in settings.
// For providers whose tokens the platform never refreshes (a Slack bot token,
// for example), this is the only way a dead credential becomes visible: the
// row flips to "Reconnect needed" and `getConnection` starts throwing
// `AppConnectionAuthFailedError`. The flag clears automatically when the
// user reconnects.
export const reportConnectionAuthFailure = async (
  connectionId: string,
  reason?: string,
): Promise<void> => {
  await postGraphqlRequest<
    { input: { id: string; reason?: string } },
    { reportAppConnectionAuthFailure: boolean }
  >({
    query: REPORT_APP_CONNECTION_AUTH_FAILURE_MUTATION,
    variables: { input: { id: connectionId, reason } },
    caller: 'reportConnectionAuthFailure',
  });
};
