import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { type SidePanelSearchAiAnswerState } from '@/side-panel/pages/search/types/SidePanelSearchAiAnswerState';
import { SESSION_COOKIE_OPT_IN_HEADER_NAME } from 'twenty-shared/constants';

const getAnswerStatus = (
  answerState: Exclude<SidePanelSearchAiAnswerState, { status: 'idle' }>,
) =>
  answerState.status === 'loaded'
    ? answerState.answer.kind
    : answerState.status;

export const sendSidePanelSearchAskAiHandoff = ({
  searchSessionId,
  answerState,
}: {
  searchSessionId: string;
  answerState: Exclude<SidePanelSearchAiAnswerState, { status: 'idle' }>;
}) => {
  // usage measurement only: a lost event must never get in the way of opening the chat
  fetch(`${REST_API_BASE_URL}/ai/search-answer/ask-ai-handoff`, {
    method: 'POST',
    credentials: 'include',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
      [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1',
    },
    body: JSON.stringify({
      searchSessionId,
      answerStatus: getAnswerStatus(answerState),
    }),
  }).catch(() => undefined);
};
