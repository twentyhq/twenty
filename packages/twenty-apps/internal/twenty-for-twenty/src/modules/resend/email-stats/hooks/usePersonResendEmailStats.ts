import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { useRecordId } from 'twenty-sdk/front-component';

import { isDefined } from '@utils/is-defined';

import { computeEmailStats, type EmailStats } from '@modules/resend/email-stats/utils/compute-email-stats';
import { extractConnection } from '@modules/resend/shared/utils/typed-client';

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

type ResendEmailLastEventNode = {
  lastEvent?: string | null;
};

export type PersonResendEmailStatsState = {
  stats: EmailStats;
  loading: boolean;
  error: string | null;
};

const buildEmptyStats = (): EmailStats => computeEmailStats([]);

export const usePersonResendEmailStats = (): PersonResendEmailStatsState => {
  const recordId = useRecordId();
  const [state, setState] = useState<PersonResendEmailStatsState>({
    stats: buildEmptyStats(),
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isDefined(recordId)) {
      setState({
        stats: buildEmptyStats(),
        loading: false,
        error: 'No record ID',
      });
      return;
    }

    let cancelled = false;

    const load = async () => {
      setState({ stats: buildEmptyStats(), loading: true, error: null });

      try {
        const client = new CoreApiClient();
        const collected: ResendEmailLastEventNode[] = [];
        let afterCursor: string | undefined;

        for (let page = 0; page < MAX_PAGES; page += 1) {
          const queryArgs: Record<string, unknown> = {
            filter: { personId: { eq: recordId } },
            first: PAGE_SIZE,
          };

          if (isDefined(afterCursor)) {
            queryArgs.after = afterCursor;
          }

          const queryResult = await client.query({
            resendEmails: {
              __args: queryArgs,
              pageInfo: {
                hasNextPage: true,
                endCursor: true,
              },
              edges: {
                node: {
                  lastEvent: true,
                },
              },
            },
          });

          const connection = extractConnection<ResendEmailLastEventNode>(
            queryResult,
            'resendEmails',
          );

          for (const edge of connection.edges) {
            collected.push(edge.node);
          }

          const hasNextPage = connection.pageInfo?.hasNextPage ?? false;
          const endCursor = connection.pageInfo?.endCursor;

          if (!hasNextPage || !isDefined(endCursor)) {
            break;
          }

          afterCursor = endCursor;
        }

        if (!cancelled) {
          setState({
            stats: computeEmailStats(collected),
            loading: false,
            error: null,
          });
        }
      } catch (fetchError) {
        if (!cancelled) {
          setState({
            stats: buildEmptyStats(),
            loading: false,
            error:
              fetchError instanceof Error
                ? fetchError.message
                : String(fetchError),
          });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [recordId]);

  return state;
};
