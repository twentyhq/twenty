import { isString, isUndefined } from '@sniptt/guards';

import { type RecallBotOperationFailure } from 'src/logic-functions/types/recall-bot-operation-result.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/recall-bot-api-request.util';

export type RecallScheduledBot = {
  id: string;
  metadata: Record<string, unknown>;
  raw: Record<string, unknown>;
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
  metadata,
}: {
  joinAtAfter: string;
  joinAtBefore: string;
  metadata?: Record<string, string>;
}): Promise<ListScheduledRecallBotsResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const bots: RecallScheduledBot[] = [];
  const searchParams = new URLSearchParams({
    join_at_after: joinAtAfter,
    join_at_before: joinAtBefore,
  });

  Object.entries(metadata ?? {}).forEach(([key, value]) => {
    searchParams.set(`metadata__${key}`, value);
  });

  let path: string | undefined = `/bot/?${searchParams.toString()}`;

  for (
    let pageIndex = 0;
    !isUndefined(path) && pageIndex < RECALL_BOT_LIST_MAX_PAGES;
    pageIndex++
  ) {
    const result = await recallBotApiRequest<RecallBotListResponse>({
      config: configResult.config,
      path,
      method: 'GET',
    });

    if (!result.ok) {
      return result;
    }

    bots.push(...extractRecallBots(result.data));
    path = extractNextPath(result.data, configResult.config.baseUrl);
  }

  if (!isUndefined(path)) {
    return {
      ok: false,
      status: null,
      errorMessage: `Recall bot list exceeded ${RECALL_BOT_LIST_MAX_PAGES} pages`,
    };
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
    const bot = asRecord(candidate);

    if (isUndefined(bot) || !isString(bot.id)) {
      return [];
    }

    return [
      {
        id: bot.id,
        metadata: asRecord(bot.metadata) ?? {},
        raw: bot,
      },
    ];
  });
};

const extractNextPath = (
  response: RecallBotListResponse | undefined,
  baseUrl: string,
): string | undefined => {
  const next = response?.next;

  if (!isString(next) || !next.startsWith(baseUrl)) {
    return undefined;
  }

  return next.slice(baseUrl.length);
};
