import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import {
  summarizeTrainerCompensation,
  type CompensationSummaryEntry,
} from 'src/logic-functions/utils/trainer-compensation-summary';
import { CompensationError } from 'src/logic-functions/utils/trainer-compensation';

type SummaryInput = { trainerId: string; startsAt: string; endsAt: string };
const handler = async (
  payload: RoutePayload<SummaryInput>,
): Promise<Response> => {
  try {
    const input = payload.body;
    if (!input?.trainerId || !input.startsAt || !input.endsAt)
      throw new CompensationError(
        'INVALID_REPORT_INPUT',
        'Выберите тренера и период.',
      );
    const client = new CoreApiClient();
    const entries: CompensationSummaryEntry[] = [];
    let after: string | undefined;
    do {
      const response = (await client.query({
        trainerPayEntries: {
          __args: { first: 200, ...(after ? { after } : {}) },
          edges: {
            node: {
              id: true,
              revision: true,
              entryType: true,
              state: true,
              snapshot: true,
              classSession: { id: true },
            },
          },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      } as never)) as unknown as {
        trainerPayEntries: {
          edges: { node: CompensationSummaryEntry }[];
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
        };
      };
      const page = response.trainerPayEntries;
      entries.push(...page.edges.map(({ node }) => node));
      if (
        page.pageInfo.hasNextPage &&
        (!page.pageInfo.endCursor || page.pageInfo.endCursor === after)
      )
        throw new CompensationError(
          'INCOMPLETE_REPORT_DATA',
          'Не удалось полностью прочитать журнал. Повторите отчёт.',
        );
      after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor! : undefined;
    } while (after);
    return new Response(
      {
        success: true,
        ...summarizeTrainerCompensation(
          entries,
          input.trainerId,
          input.startsAt,
          input.endsAt,
        ),
      },
      { status: 200 },
    );
  } catch (error) {
    return new Response(
      {
        success: false,
        message:
          error instanceof CompensationError
            ? error.message
            : 'Не удалось построить отчёт. Повторите запрос.',
      },
      { status: error instanceof CompensationError ? 409 : 503 },
    );
  }
};
export default defineLogicFunction({
  universalIdentifier: '35d90b94-06c8-4dfd-aab7-f156a5b69f16',
  name: 'studio-trainer-compensation-summary',
  description:
    'Summarize completed trainer accruals without double-counting corrections',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: '/studio/compensation/summary',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
