import { act, renderHook } from '@testing-library/react';

import { SIDE_PANEL_SEARCH_AI_ANSWER_DEBOUNCE_MS } from '@/side-panel/pages/search/constants/SidePanelSearchAiAnswerDebounceMs';
import { useSidePanelSearchAiAnswer } from '@/side-panel/pages/search/hooks/useSidePanelSearchAiAnswer';
import { type SearchResultItem } from '@/side-panel/pages/search/types/SearchResultItem';
import { type SidePanelSearchAiAnswer } from '@/side-panel/pages/search/types/SidePanelSearchAiAnswer';
import { fetchSidePanelSearchAiAnswer } from '@/side-panel/pages/search/utils/fetchSidePanelSearchAiAnswer';

const mockHasPermissionFlag = jest.fn(() => true);

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => mockHasPermissionFlag(),
}));

jest.mock(
  '@/side-panel/pages/search/utils/fetchSidePanelSearchAiAnswer',
  () => ({
    fetchSidePanelSearchAiAnswer: jest.fn(),
  }),
);

const mockFetchAnswer = jest.mocked(fetchSidePanelSearchAiAnswer);

type HookProps = Parameters<typeof useSidePanelSearchAiAnswer>[0];

const buildResult = (recordId: string, label: string): SearchResultItem => ({
  id: recordId,
  recordId,
  label,
  objectNameSingular: 'company',
  objectLabel: 'Company',
  avatarShape: 'square',
});

const ACME = buildResult('acme-id', 'Acme');
const GLOBEX = buildResult('globex-id', 'Globex');

const acmeAnswer: SidePanelSearchAiAnswer = {
  kind: 'answer',
  text: 'Acme is based in Paris.',
  sources: [
    { objectNameSingular: 'company', recordId: 'acme-id', displayName: 'Acme' },
  ],
};

const createDeferredAnswer = () => {
  let resolve: (answer: SidePanelSearchAiAnswer) => void = () => {};
  let reject: (error: Error) => void = () => {};
  const promise = new Promise<SidePanelSearchAiAnswer>(
    (resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    },
  );

  return { promise, resolve, reject };
};

const renderAnswerHook = (initialProps: HookProps) =>
  renderHook((props: HookProps) => useSidePanelSearchAiAnswer(props), {
    initialProps,
  });

const waitForTypingPause = () =>
  act(async () => {
    jest.advanceTimersByTime(SIDE_PANEL_SEARCH_AI_ANSWER_DEBOUNCE_MS);
  });

const getRequestSignal = (callIndex: number) =>
  mockFetchAnswer.mock.calls[callIndex][0].signal;

describe('useSidePanelSearchAiAnswer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockFetchAnswer.mockReset();
    mockHasPermissionFlag.mockReturnValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('asks once typing pauses and results for that query have arrived', async () => {
    const deferredAnswer = createDeferredAnswer();

    mockFetchAnswer.mockReturnValue(deferredAnswer.promise);

    const { result, rerender } = renderAnswerHook({
      question: 'Where is Acme based?',
      objectFilter: null,
      searchResultItems: [],
      areSearchResultsCurrent: false,
    });

    await waitForTypingPause();

    expect(mockFetchAnswer).not.toHaveBeenCalled();
    expect(result.current.answerState).toEqual({ status: 'idle' });

    rerender({
      question: 'Where is Acme based?',
      objectFilter: null,
      searchResultItems: [ACME, GLOBEX],
      areSearchResultsCurrent: true,
    });

    expect(mockFetchAnswer).toHaveBeenCalledTimes(1);
    expect(mockFetchAnswer.mock.calls[0][0]).toMatchObject({
      question: 'Where is Acme based?',
      candidates: [
        { objectNameSingular: 'company', recordId: 'acme-id' },
        { objectNameSingular: 'company', recordId: 'globex-id' },
      ],
      trigger: 'automatic',
      searchScope: null,
      searchSessionId: result.current.searchSessionId,
    });
    expect(result.current.answerState).toEqual({ status: 'loading' });

    await act(async () => {
      deferredAnswer.resolve(acmeAnswer);
    });

    expect(result.current.answerState).toEqual({
      status: 'loaded',
      answer: acmeAnswer,
    });
  });

  it('never sends the previous query results while the new query loads', async () => {
    mockFetchAnswer.mockResolvedValue(acmeAnswer);

    const { result, rerender } = renderAnswerHook({
      question: 'Where is Acme?',
      objectFilter: null,
      searchResultItems: [ACME],
      areSearchResultsCurrent: true,
    });

    await waitForTypingPause();

    expect(result.current.answerState.status).toBe('loaded');

    rerender({
      question: 'Who works at Globex?',
      objectFilter: null,
      searchResultItems: [ACME],
      areSearchResultsCurrent: false,
    });

    expect(result.current.answerState).toEqual({ status: 'idle' });

    await waitForTypingPause();

    expect(mockFetchAnswer).toHaveBeenCalledTimes(1);

    rerender({
      question: 'Who works at Globex?',
      objectFilter: null,
      searchResultItems: [GLOBEX],
      areSearchResultsCurrent: true,
    });

    expect(mockFetchAnswer).toHaveBeenCalledTimes(2);
    expect(mockFetchAnswer.mock.calls[1][0]).toMatchObject({
      question: 'Who works at Globex?',
      candidates: [{ objectNameSingular: 'company', recordId: 'globex-id' }],
    });

    await act(async () => {});

    expect(result.current.answerState.status).toBe('loaded');
  });

  it('cancels and ignores the answer to a question the user kept typing past', async () => {
    const firstAnswer = createDeferredAnswer();

    mockFetchAnswer.mockReturnValueOnce(firstAnswer.promise);

    const { result, rerender } = renderAnswerHook({
      question: 'Where is Acme',
      objectFilter: null,
      searchResultItems: [ACME],
      areSearchResultsCurrent: true,
    });

    await waitForTypingPause();

    expect(result.current.answerState).toEqual({ status: 'loading' });

    rerender({
      question: 'Where is Acme based?',
      objectFilter: null,
      searchResultItems: [ACME],
      areSearchResultsCurrent: true,
    });

    expect(getRequestSignal(0).aborted).toBe(true);
    expect(result.current.answerState).toEqual({ status: 'idle' });

    await act(async () => {
      firstAnswer.resolve(acmeAnswer);
    });

    expect(result.current.answerState).toEqual({ status: 'idle' });
  });

  it('drops the answer as soon as the object filter changes', async () => {
    mockFetchAnswer.mockResolvedValue(acmeAnswer);

    const { result, rerender } = renderAnswerHook({
      question: 'Where is Acme based?',
      objectFilter: null,
      searchResultItems: [ACME],
      areSearchResultsCurrent: true,
    });

    await waitForTypingPause();

    expect(result.current.answerState.status).toBe('loaded');

    rerender({
      question: 'Where is Acme based?',
      objectFilter: 'person',
      searchResultItems: [ACME],
      areSearchResultsCurrent: true,
    });

    expect(result.current.answerState).toEqual({ status: 'idle' });
  });

  it('reports a failed request as failed, not as a handoff', async () => {
    mockFetchAnswer.mockRejectedValue(new Error('Payment required'));

    const { result } = renderAnswerHook({
      question: 'Where is Acme based?',
      objectFilter: null,
      searchResultItems: [ACME],
      areSearchResultsCurrent: true,
    });

    await waitForTypingPause();

    expect(result.current.answerState).toEqual({ status: 'failed' });
  });

  it('stays idle for members who cannot use AI and for very short queries', async () => {
    mockHasPermissionFlag.mockReturnValue(false);

    const { result, rerender } = renderAnswerHook({
      question: 'Where is Acme based?',
      objectFilter: null,
      searchResultItems: [ACME],
      areSearchResultsCurrent: true,
    });

    await waitForTypingPause();

    expect(result.current.answerState).toEqual({ status: 'idle' });

    mockHasPermissionFlag.mockReturnValue(true);
    rerender({
      question: 'Ac',
      objectFilter: null,
      searchResultItems: [ACME],
      areSearchResultsCurrent: true,
    });

    await waitForTypingPause();

    expect(result.current.answerState).toEqual({ status: 'idle' });
    expect(mockFetchAnswer).not.toHaveBeenCalled();
  });

  it('only offers a quick answer for plain searches and asks once it is requested', async () => {
    mockFetchAnswer.mockResolvedValue(acmeAnswer);

    const { result } = renderAnswerHook({
      question: 'Acme website',
      objectFilter: 'company',
      searchResultItems: [ACME],
      areSearchResultsCurrent: true,
    });

    await waitForTypingPause();

    expect(mockFetchAnswer).not.toHaveBeenCalled();
    expect(result.current.answerState).toEqual({
      status: 'quickAnswerAvailable',
      reason: 'notAQuestion',
    });

    await act(async () => {
      result.current.requestQuickAnswer();
    });

    expect(mockFetchAnswer).toHaveBeenCalledTimes(1);
    expect(mockFetchAnswer.mock.calls[0][0]).toMatchObject({
      question: 'Acme website',
      trigger: 'manual',
      searchScope: 'company',
    });
    expect(result.current.answerState).toEqual({
      status: 'loaded',
      answer: acmeAnswer,
    });
  });

  it('falls back to a quick answer action once the automatic allowance is used up', async () => {
    mockFetchAnswer.mockResolvedValueOnce({ kind: 'limited' });
    mockFetchAnswer.mockResolvedValueOnce(acmeAnswer);

    const { result } = renderAnswerHook({
      question: 'Where is Acme based?',
      objectFilter: null,
      searchResultItems: [ACME],
      areSearchResultsCurrent: true,
    });

    await waitForTypingPause();

    expect(result.current.answerState).toEqual({
      status: 'quickAnswerAvailable',
      reason: 'automaticLimitReached',
    });

    await act(async () => {
      result.current.requestQuickAnswer();
    });

    expect(mockFetchAnswer).toHaveBeenCalledTimes(2);
    expect(mockFetchAnswer.mock.calls[1][0]).toMatchObject({
      trigger: 'manual',
    });
    expect(result.current.answerState).toEqual({
      status: 'loaded',
      answer: acmeAnswer,
    });
  });
});
