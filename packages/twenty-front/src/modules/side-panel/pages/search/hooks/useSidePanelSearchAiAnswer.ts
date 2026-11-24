import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SIDE_PANEL_SEARCH_AI_ANSWER_DEBOUNCE_MS } from '@/side-panel/pages/search/constants/SidePanelSearchAiAnswerDebounceMs';
import { SIDE_PANEL_SEARCH_AI_ANSWER_MAX_CANDIDATES } from '@/side-panel/pages/search/constants/SidePanelSearchAiAnswerMaxCandidates';
import { SIDE_PANEL_SEARCH_AI_ANSWER_MIN_QUESTION_LENGTH } from '@/side-panel/pages/search/constants/SidePanelSearchAiAnswerMinQuestionLength';
import { type SearchResultItem } from '@/side-panel/pages/search/types/SearchResultItem';
import { type SidePanelSearchAiAnswerCandidate } from '@/side-panel/pages/search/types/SidePanelSearchAiAnswerCandidate';
import { type SidePanelSearchAiAnswerState } from '@/side-panel/pages/search/types/SidePanelSearchAiAnswerState';
import { type SidePanelSearchAiAnswerTrigger } from '@/side-panel/pages/search/types/SidePanelSearchAiAnswerTrigger';
import { fetchSidePanelSearchAiAnswer } from '@/side-panel/pages/search/utils/fetchSidePanelSearchAiAnswer';
import { isEligibleForAutomaticSidePanelSearchAiAnswer } from '@/side-panel/pages/search/utils/isEligibleForAutomaticSidePanelSearchAiAnswer';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { v4 } from 'uuid';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type SidePanelSearchAiAnswerRequest = {
  requestKey: string;
  state: SidePanelSearchAiAnswerState;
};

const IDLE_STATE: SidePanelSearchAiAnswerState = { status: 'idle' };
const LOADING_STATE: SidePanelSearchAiAnswerState = { status: 'loading' };
const QUICK_ANSWER_AVAILABLE_STATE: SidePanelSearchAiAnswerState = {
  status: 'quickAnswerAvailable',
  reason: 'notAQuestion',
};

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
  const isAutomatic = isEligibleForAutomaticSidePanelSearchAiAnswer(question);

  const [searchSessionId] = useState(() => v4());

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
  const [manualRequestKey, setManualRequestKey] = useState<string | null>(null);

  // Dropped during render, so returning to an earlier query never flashes its old answer
  if (answerRequest !== null && answerRequest.requestKey !== requestKey) {
    setAnswerRequest(null);
  }

  if (manualRequestKey !== null && manualRequestKey !== requestKey) {
    setManualRequestKey(null);
  }

  const getTrigger = (): SidePanelSearchAiAnswerTrigger | null => {
    if (manualRequestKey === requestKey) {
      return 'manual';
    }

    return isAutomatic && settledRequestKey === requestKey ? 'automatic' : null;
  };

  const trigger = isAvailable && areSearchResultsCurrent ? getTrigger() : null;

  useEffect(() => {
    if (trigger === null) {
      return;
    }

    const abortController = new AbortController();

    setAnswerRequest({ requestKey, state: LOADING_STATE });

    fetchSidePanelSearchAiAnswer({
      question,
      candidates,
      trigger,
      searchScope: objectFilter,
      searchSessionId,
      signal: abortController.signal,
    })
      .then((response) => {
        if (abortController.signal.aborted) {
          return;
        }

        setAnswerRequest({
          requestKey,
          state:
            response.kind === 'limited'
              ? {
                  status: 'quickAnswerAvailable',
                  reason: 'automaticLimitReached',
                }
              : { status: 'loaded', answer: response },
        });
      })
      .catch(() => {
        if (!abortController.signal.aborted) {
          setAnswerRequest({ requestKey, state: { status: 'failed' } });
        }
      });

    return () => abortController.abort();
  }, [
    trigger,
    requestKey,
    question,
    objectFilter,
    candidates,
    searchSessionId,
  ]);

  const requestQuickAnswer = () => setManualRequestKey(requestKey);

  const getAnswerState = (): SidePanelSearchAiAnswerState => {
    if (!isAvailable) {
      return IDLE_STATE;
    }

    if (answerRequest?.requestKey === requestKey) {
      return answerRequest.state;
    }

    if (manualRequestKey === requestKey) {
      return LOADING_STATE;
    }

    return isAutomatic ? IDLE_STATE : QUICK_ANSWER_AVAILABLE_STATE;
  };

  return {
    answerState: getAnswerState(),
    requestQuickAnswer,
    searchSessionId,
  };
};
