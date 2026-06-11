import { type RecallBotOperationFailure } from 'src/logic-functions/types/recall-bot-operation-result.type';
import { getRecallApiConfig } from 'src/logic-functions/utils/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/utils/recall-bot-api-request.util';

export type RecallScheduledBot = {
  id: string;
  metadata: Record<string, unknown>;
};

type RecallBotListResponse = {
  next?: unknown;
  results?: unknown;
};

type ListScheduledRecallBotsResult =
  | { ok: true; bots: RecallScheduledBot[] }
  | RecallBotOperationFailure;

const RECALL_BOT_LIST_MAX_PAGES = 10;

export const listScheduledRecallBots = async ({
  joinAtAfter,
  joinAtBefore,
}: {
  joinAtAfter: string;
  joinAtBefore: string;
}): Promise<ListScheduledRecallBotsResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const bots: RecallScheduledBot[] = [];
  let path: string | null = `/bot/?join_at_after=${encodeURIComponent(
    joinAtAfter,
  )}&join_at_before=${encodeURIComponent(joinAtBefore)}`;

  for (
    let pageIndex = 0;
    path !== null && pageIndex < RECALL_BOT_LIST_MAX_PAGES;
    pageIndex++
  ) {
    const result = await recallBotApiRequest<RecallBotListResponse>({
      apiKey: configResult.config.apiKey,
      baseUrl: configResult.config.baseUrl,
      path,
      method: 'GET',
    });

    if (!result.ok) {
      return result;
    }

    bots.push(...extractRecallBots(result.data));
    path = extractNextPath(result.data, configResult.config.baseUrl);
  }

  return { ok: true, bots };
};

const extractRecallBots = (
  response: RecallBotListResponse | undefined,
): RecallScheduledBot[] => {
  if (!Array.isArray(response?.results)) {
    return [];
  }

  return response.results.flatMap((candidate: unknown) => {
    if (
      typeof candidate !== 'object' ||
      candidate === null ||
      typeof (candidate as { id?: unknown }).id !== 'string'
    ) {
      return [];
    }

    const metadata = (candidate as { metadata?: unknown }).metadata;

    return [
      {
        id: (candidate as { id: string }).id,
        metadata:
          typeof metadata === 'object' && metadata !== null
            ? (metadata as Record<string, unknown>)
            : {},
      },
    ];
  });
};

const extractNextPath = (
  response: RecallBotListResponse | undefined,
  baseUrl: string,
): string | null => {
  const next = response?.next;

  if (typeof next !== 'string' || !next.startsWith(baseUrl)) {
    return null;
  }

  return next.slice(baseUrl.length);
};
