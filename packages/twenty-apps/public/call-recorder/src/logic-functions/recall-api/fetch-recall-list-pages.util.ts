import { isString, isUndefined } from '@sniptt/guards';

import { type RecallBotOperationFailure } from 'src/logic-functions/types/recall-bot-operation-result.type';
import { type RecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/recall-bot-api-request.util';

export type RecallListResponse = {
  next?: unknown;
  results?: unknown;
};

export const fetchRecallListPages = async <TItem>({
  config,
  initialPath,
  maxPages,
  extractPageItems,
  malformedErrorMessage,
}: {
  config: RecallApiConfig;
  initialPath: string;
  maxPages: number;
  extractPageItems: (
    response: RecallListResponse | undefined,
  ) => TItem[] | undefined;
  malformedErrorMessage: string;
}): Promise<
  { ok: true; items: TItem[]; truncated: boolean } | RecallBotOperationFailure
> => {
  const items: TItem[] = [];
  let path: string | undefined = initialPath;

  for (
    let pageIndex = 0;
    !isUndefined(path) && pageIndex < maxPages;
    pageIndex++
  ) {
    const result = await recallBotApiRequest<RecallListResponse>({
      config,
      path,
      method: 'GET',
    });

    if (!result.ok) {
      return result;
    }

    const pageItems = extractPageItems(result.data);

    if (isUndefined(pageItems)) {
      return {
        ok: false,
        status: result.status,
        errorMessage: malformedErrorMessage,
      };
    }

    items.push(...pageItems);
    path = extractNextPath(result.data, config.baseUrl);
  }

  return { ok: true, items, truncated: !isUndefined(path) };
};

const extractNextPath = (
  response: RecallListResponse | undefined,
  baseUrl: string,
): string | undefined => {
  const next = response?.next;

  if (!isString(next) || !next.startsWith(baseUrl)) {
    return undefined;
  }

  return next.slice(baseUrl.length);
};
