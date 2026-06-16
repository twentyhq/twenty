import { ASK_AI_THREAD_ID_QUERY_PARAM } from '@/ai/constants/AskAiThreadIdQueryParam';
import { isNonEmptyString } from '@sniptt/guards';


export const buildAskAiThreadRedirectPath = ({
  pathname,
  search,
  threadId,
}: {
  pathname: string;
  search: string;
  threadId: string | null;
}): string => {
  const searchParams = new URLSearchParams(search);

  if (isNonEmptyString(threadId)) {
    searchParams.set(ASK_AI_THREAD_ID_QUERY_PARAM, threadId);
  }

  const queryString = searchParams.toString();

  return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
};
