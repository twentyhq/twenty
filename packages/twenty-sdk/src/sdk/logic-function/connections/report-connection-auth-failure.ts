import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const REPORT_APP_CONNECTION_AUTH_FAILURE_MUTATION = `
  mutation ReportAppConnectionAuthFailure($input: ReportAppConnectionAuthFailureInput!) {
    reportAppConnectionAuthFailure(input: $input)
  }
`;

export const reportConnectionAuthFailure = async ({
  connectionId,
  reason,
}: {
  connectionId: string;
  reason?: string;
}): Promise<void> => {
  await postGraphqlRequest<
    { input: { id: string; reason?: string } },
    { reportAppConnectionAuthFailure: boolean }
  >({
    query: REPORT_APP_CONNECTION_AUTH_FAILURE_MUTATION,
    variables: { input: { id: connectionId, reason } },
    caller: 'reportConnectionAuthFailure',
  });
};
