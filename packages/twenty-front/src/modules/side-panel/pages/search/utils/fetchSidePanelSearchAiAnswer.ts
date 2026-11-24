import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { type SidePanelSearchAiAnswerCandidate } from '@/side-panel/pages/search/types/SidePanelSearchAiAnswerCandidate';
import { type SidePanelSearchAiAnswerResponse } from '@/side-panel/pages/search/types/SidePanelSearchAiAnswerResponse';
import { type SidePanelSearchAiAnswerTrigger } from '@/side-panel/pages/search/types/SidePanelSearchAiAnswerTrigger';
import { SESSION_COOKIE_OPT_IN_HEADER_NAME } from 'twenty-shared/constants';
import { doNotTranslate } from 'twenty-shared/i18n';
import { CustomError } from 'twenty-shared/utils';
import { z } from 'zod';

const sidePanelSearchAiAnswerResponseSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('answer'),
    text: z.string().min(1),
    sources: z
      .array(
        z.object({
          objectNameSingular: z.string(),
          recordId: z.string(),
          displayName: z.string(),
        }),
      )
      .min(1),
  }),
  z.object({ kind: z.literal('handoff') }),
  z.object({ kind: z.literal('limited') }),
]);

export const fetchSidePanelSearchAiAnswer = async ({
  question,
  candidates,
  trigger,
  searchScope,
  searchSessionId,
  signal,
}: {
  question: string;
  candidates: SidePanelSearchAiAnswerCandidate[];
  trigger: SidePanelSearchAiAnswerTrigger;
  searchScope: string | null;
  searchSessionId: string;
  signal: AbortSignal;
}): Promise<SidePanelSearchAiAnswerResponse> => {
  const response = await fetch(`${REST_API_BASE_URL}/ai/search-answer`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1',
    },
    body: JSON.stringify({
      question,
      candidates,
      trigger,
      searchScope,
      searchSessionId,
    }),
    signal,
  });

  if (!response.ok) {
    throw new CustomError(
      doNotTranslate(`Search answer request failed: ${response.status}`),
      'SIDE_PANEL_SEARCH_AI_ANSWER_REQUEST_FAILED',
    );
  }

  return sidePanelSearchAiAnswerResponseSchema.parse(await response.json());
};
