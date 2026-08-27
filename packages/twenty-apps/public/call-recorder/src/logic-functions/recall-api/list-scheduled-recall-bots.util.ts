import { isUndefined } from '@sniptt/guards';

import { type RecallBotOperationFailure } from 'src/logic-functions/types/recall-bot-operation-result.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import {
  fetchRecallListPages,
  type RecallListResponse,
} from 'src/logic-functions/recall-api/fetch-recall-list-pages.util';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { parseRecallBotSnapshot } from 'src/logic-functions/recall-api/parse-recall-bot-snapshot.util';
import { type RecallBotSnapshot } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';

export type RecallScheduledBot = RecallBotSnapshot & {
  id: string;
};

type ListScheduledRecallBotsResult =
  | { ok: true; bots: RecallScheduledBot[]; truncated: boolean }
  | RecallBotOperationFailure;

const RECALL_BOT_LIST_MAX_PAGES = 10;

type ListScheduledRecallBotsArguments = {
  joinAtAfter?: string;
  joinAtBefore?: string;
  metadata?: Record<string, string>;
  statuses?: string[];
};

export const listScheduledRecallBots = async (
  listScheduledRecallBotsArguments: ListScheduledRecallBotsArguments,
): Promise<ListScheduledRecallBotsResult> =>
  listScheduledRecallBotsWithPageRequestPolicy({
    listScheduledRecallBotsArguments,
    shouldStartPageRequest: () => true,
  });

export const listScheduledRecallBotsBeforeRequestCutoff = async ({
  requestStartCutoffEpochMs,
  ...listScheduledRecallBotsArguments
}: ListScheduledRecallBotsArguments & {
  requestStartCutoffEpochMs: number;
}): Promise<ListScheduledRecallBotsResult> =>
  listScheduledRecallBotsWithPageRequestPolicy({
    listScheduledRecallBotsArguments,
    shouldStartPageRequest: () => Date.now() < requestStartCutoffEpochMs,
  });

const listScheduledRecallBotsWithPageRequestPolicy = async ({
  listScheduledRecallBotsArguments: {
    joinAtAfter,
    joinAtBefore,
    metadata,
    statuses,
  },
  shouldStartPageRequest,
}: {
  listScheduledRecallBotsArguments: ListScheduledRecallBotsArguments;
  shouldStartPageRequest: () => boolean;
}): Promise<ListScheduledRecallBotsResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const searchParameters = new URLSearchParams();

  if (!isUndefined(joinAtAfter)) {
    searchParameters.set('join_at_after', joinAtAfter);
  }

  if (!isUndefined(joinAtBefore)) {
    searchParameters.set('join_at_before', joinAtBefore);
  }

  Object.entries(metadata ?? {}).forEach(([key, value]) => {
    searchParameters.set(`metadata__${key}`, value);
  });

  statuses?.forEach((status) => {
    searchParameters.append('status', status);
  });

  const result = await fetchRecallListPages({
    config: configResult.config,
    initialPath: `/bot/?${searchParameters.toString()}`,
    maxPages: RECALL_BOT_LIST_MAX_PAGES,
    shouldStartPageRequest,
    extractPageItems: extractRecallBots,
    malformedErrorMessage: 'Recall API returned malformed bot list',
  });

  if (!result.ok) {
    return result;
  }

  if (result.truncated && process.env.NODE_ENV !== 'test') {
    console.warn(
      `[call-recorder] Recall bot list exceeded ${RECALL_BOT_LIST_MAX_PAGES} pages; continuing with ${result.items.length} fetched bots`,
    );
  }

  return { ok: true, bots: result.items, truncated: result.truncated };
};

const extractRecallBots = (
  response: RecallListResponse | undefined,
): RecallScheduledBot[] => {
  if (!Array.isArray(response?.results)) {
    return [];
  }

  return response.results.flatMap((candidate: unknown) => {
    const bot = asRecord(candidate);

    if (isUndefined(bot)) {
      return [];
    }

    const snapshot = parseRecallBotSnapshot(bot);

    if (isUndefined(snapshot.id)) {
      return [];
    }

    return [{ ...snapshot, id: snapshot.id }];
  });
};
