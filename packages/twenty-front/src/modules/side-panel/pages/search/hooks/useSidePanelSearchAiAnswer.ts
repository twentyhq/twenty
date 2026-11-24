import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SIDE_PANEL_SEARCH_AI_ANSWER_DEBOUNCE_MS } from '@/side-panel/pages/search/constants/SidePanelSearchAiAnswerDebounceMs';
import { SIDE_PANEL_SEARCH_AI_ANSWER_MAX_CANDIDATES } from '@/side-panel/pages/search/constants/SidePanelSearchAiAnswerMaxCandidates';
import { SIDE_PANEL_SEARCH_AI_ANSWER_MIN_QUESTION_LENGTH } from '@/side-panel/pages/search/constants/SidePanelSearchAiAnswerMinQuestionLength';
import { type SearchResultItem } from '@/side-panel/pages/search/types/SearchResultItem';
import { type SidePanelSearchAiAnswerCandidate } from '@/side-panel/pages/search/types/SidePanelSearchAiAnswerCandidate';
import { type SidePanelSearchAiAnswerState } from '@/side-panel/pages/search/types/SidePanelSearchAiAnswerState';
import { fetchSidePanelSearchAiAnswer } from '@/side-panel/pages/search/utils/fetchSidePanelSearchAiAnswer';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type SidePanelSearchAiAnswerRequest = {
  requestKey: string;
  state: SidePanelSearchAiAnswerState;
};

const IDLE_STATE: SidePanelSearchAiAnswerState = { status: 'idle' };

export const useSidePanelSearchAiAnswer = ({
  question,
  objectFilter,
  searchResultItems,
  areSearchResultsCurrent,
}: {
  question: string;
  objectFilter: string | null;
  searchResultItems: SearchResultItem[];
  areSearchResultsCurrent: boolean;
}) => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isAvailable =
    hasAiPermission &&
    question.length >= SIDE_PANEL_SEARCH_AI_ANSWER_MIN_QUESTION_LENGTH;

  const requestKey = JSON.stringify([question, objectFilter]);
  const [settledRequestKey] = useDebounce(
    requestKey,
    SIDE_PANEL_SEARCH_AI_ANSWER_DEBOUNCE_MS,
  );

  // Keyed on ids so a refetch returning the same records does not ask again
  const candidatesKey = JSON.stringify(
    searchResultItems
      .slice(0, SIDE_PANEL_SEARCH_AI_ANSWER_MAX_CANDIDATES)
      .map(({ objectNameSingular, recordId }) => ({
        objectNameSingular,
        recordId,
      })),
  );
  const candidates = useMemo(
    () => JSON.parse(candidatesKey) as SidePanelSearchAiAnswerCandidate[],
    [candidatesKey],
  );

  const [answerRequest, setAnswerRequest] =
    useState<SidePanelSearchAiAnswerRequest | null>(null);

  // Dropped during render, so returning to an earlier query never flashes its old answer
  if (answerRequest !== null && answerRequest.requestKey !== requestKey) {
    setAnswerRequest(null);
  }

  const shouldRequestAnswer =
    isAvailable && areSearchResultsCurrent && settledRequestKey === requestKey;

  useEffect(() => {
    if (!shouldRequestAnswer) {
      return;
    }

    const abortController = new AbortController();

    setAnswerRequest({ requestKey, state: { status: 'loading' } });

    fetchSidePanelSearchAiAnswer({
      question,
      candidates,
      signal: abortController.signal,
    })
      .then((answer) => {
        if (!abortController.signal.aborted) {
          setAnswerRequest({ requestKey, state: { status: 'loaded', answer } });
        }
      })
      .catch(() => {
        if (!abortController.signal.aborted) {
          setAnswerRequest({ requestKey, state: { status: 'failed' } });
        }
      });

    return () => abortController.abort();
  }, [shouldRequestAnswer, requestKey, question, candidates]);

  const answerState =
    isAvailable && answerRequest?.requestKey === requestKey
      ? answerRequest.state
      : IDLE_STATE;

  return { answerState };
};
