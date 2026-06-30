import { isDefined } from '@utils/is-defined';

import { RESEND_PAGE_SIZE } from '@modules/resend/constants/sync-config';
import { withRateLimitRetry } from '@modules/resend/shared/utils/with-rate-limit-retry';

export type ResendListFunction<T> = (paginationParameters: {
  limit: number;
  after?: string;
}) => Promise<{
  data: { data: T[]; has_more: boolean } | null;
  error: unknown;
}>;

export type ForEachPageOptions = {
  startCursor?: string;
  onCursorAdvance?: (cursor: string) => Promise<void>;
  deadlineAtMs?: number;
};

export type OnPageResult = {
  ok: boolean;
  stop?: boolean;
  errors?: ReadonlyArray<string>;
};

export type OnPageHandler<T> = (
  items: T[],
  pageNumber: number,
) => Promise<OnPageResult | void>;

export type ForEachPageResult = {
  completed: boolean;
};

export const forEachPage = async <T extends { id: string }>(
  listFunction: ResendListFunction<T>,
  onPage: OnPageHandler<T>,
  label = 'items',
  options?: ForEachPageOptions,
): Promise<ForEachPageResult> => {
  let cursor: string | undefined = options?.startCursor;
  let pageNumber = 0;
  let totalFetched = 0;

  while (true) {
    const paginationParameters = {
      limit: RESEND_PAGE_SIZE,
      ...(isDefined(cursor) && cursor.length > 0 && { after: cursor }),
    };
    const response = await withRateLimitRetry(
      () => listFunction(paginationParameters),
      { channel: label },
    );

    if (isDefined(response.error)) {
      throw new Error(
        `Resend list[${label}] failed at cursor=${cursor ?? 'start'}: ${JSON.stringify(response.error)}`,
      );
    }

    const page = response.data;

    if (!isDefined(page) || page.data.length === 0) {
      return { completed: true };
    }

    pageNumber++;
    totalFetched += page.data.length;

    console.log(
      `[resend] fetched ${label} page ${pageNumber} (size=${page.data.length}, total=${totalFetched}, has_more=${page.has_more})`,
    );

    const handlerResult = await onPage(page.data, pageNumber);
    const pageOk = handlerResult?.ok ?? true;
    const shouldStop = handlerResult?.stop === true;

    if (!pageOk) {
      const perItemErrors = handlerResult?.errors ?? [];
      const detail =
        perItemErrors.length > 0
          ? ` failures: ${perItemErrors.join(' | ')}`
          : '';

      console.warn(
        `[resend] ${label} page ${pageNumber} had per-item failures at cursor=${cursor ?? 'start'}; advancing past the page.${detail}`,
      );
    }

    const nextCursor = page.data[page.data.length - 1].id;

    if (isDefined(options?.onCursorAdvance)) {
      await options.onCursorAdvance(nextCursor);
    }

    if (shouldStop) {
      return { completed: true };
    }

    if (!page.has_more) {
      return { completed: true };
    }

    if (nextCursor === cursor) {
      throw new Error(`Resend list[${label}] cursor stuck at ${nextCursor}`);
    }

    if (
      isDefined(options?.deadlineAtMs) &&
      Date.now() >= options.deadlineAtMs
    ) {
      console.log(
        `[resend] reached deadline for ${label} after page ${pageNumber}; stopping early (cursor will resume next tick)`,
      );

      return { completed: false };
    }

    cursor = nextCursor;
  }
};
