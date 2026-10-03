import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement, type ReactNode } from 'react';

import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { aiChatThreadIdBeingRenamedComponentState } from '@/ai/states/aiChatThreadIdBeingRenamedComponentState';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { type AgentChatThread } from '~/generated-metadata/graphql';

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: jest.fn(),
}));
jest.mock('twenty-ui/components', () => ({
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

const expectRenamedTo = (
  updateOneRecord: jest.Mock,
  id: string,
  title: string,
) =>
  expect(updateOneRecord).toHaveBeenCalledWith({
    objectNameSingular: 'agentChatThread',
    idToUpdate: id,
    updateOneRecordInput: { title },
  });

const buildThread = (
  overrides: Partial<AgentChatThread> = {},
): AgentChatThread =>
  ({
    id: 'thread-1',
    title: 'Existing title',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
    totalInputTokens: 0,
    totalOutputTokens: 0,
    contextWindowTokens: null,
    conversationSize: 0,
    totalInputCredits: 0,
    totalOutputCredits: 0,
    ...overrides,
  }) as AgentChatThread;

const commandMenuInstanceId = 'command-menu-id';

const Wrapper = ({ children }: { children: ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

const renderRename = (thread: AgentChatThread) =>
  renderHook(() => useAiChatThreadRename({ thread, commandMenuInstanceId }), {
    wrapper: Wrapper,
  });

const startRename = (threadId: string) =>
  act(() => {
    jotaiStore.set(
      aiChatThreadIdBeingRenamedComponentState.atomFamily({
        instanceId: commandMenuInstanceId,
      }),
      threadId,
    );
  });

describe('useAiChatThreadRename', () => {
  const updateOneRecord = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    updateOneRecord.mockResolvedValue({});
    (useUpdateOneRecord as jest.Mock).mockReturnValue({ updateOneRecord });
  });

  it('starts in non-renaming state with the current thread title as draft', () => {
    const { result } = renderRename(buildThread({ title: 'Existing title' }));

    expect(result.current.isRenaming).toBe(false);
    expect(result.current.draftTitle).toBe('Existing title');
  });

  it('falls back to empty string when the thread title is null', () => {
    const { result } = renderRename(buildThread({ title: null }));

    expect(result.current.draftTitle).toBe('');
  });

  it('enters renaming mode with the current title as draft when its command menu starts a rename', () => {
    const { result } = renderRename(buildThread({ title: 'Existing title' }));

    startRename('thread-1');

    expect(result.current.isRenaming).toBe(true);
    expect(result.current.draftTitle).toBe('Existing title');
  });

  it('stays out of renaming mode when another chat is being renamed', () => {
    const { result } = renderRename(buildThread({ title: 'Existing title' }));

    startRename('thread-2');

    expect(result.current.isRenaming).toBe(false);
  });

  it('exits renaming mode and resets the draft on cancelRename', () => {
    const { result } = renderRename(buildThread({ title: 'Existing title' }));

    startRename('thread-1');
    act(() => {
      result.current.setDraftTitle('Edited draft');
    });
    act(() => {
      result.current.cancelRename();
    });

    expect(result.current.isRenaming).toBe(false);
    expect(result.current.draftTitle).toBe('Existing title');
  });

  it('skips renaming when committed title is empty after trim', async () => {
    const { result } = renderRename(buildThread({ title: 'Existing title' }));

    await act(async () => {
      await result.current.commitRename('   ');
    });

    expect(updateOneRecord).not.toHaveBeenCalled();
    expect(result.current.isRenaming).toBe(false);
  });

  it('skips renaming when committed title equals the current title', async () => {
    const { result } = renderRename(buildThread({ title: 'Existing title' }));

    await act(async () => {
      await result.current.commitRename('Existing title');
    });

    expect(updateOneRecord).not.toHaveBeenCalled();
  });

  it('trims surrounding whitespace before comparing to the current title', async () => {
    const { result } = renderRename(buildThread({ title: 'Existing title' }));

    await act(async () => {
      await result.current.commitRename('  Existing title  ');
    });

    expect(updateOneRecord).not.toHaveBeenCalled();
  });

  it('renames with the trimmed title when it differs from the current one', async () => {
    const { result } = renderRename(
      buildThread({ id: 'thread-7', title: 'Old title' }),
    );

    await act(async () => {
      await result.current.commitRename('  New title  ');
    });

    expectRenamedTo(updateOneRecord, 'thread-7', 'New title');
    expect(result.current.isRenaming).toBe(false);
  });

  it('keeps renaming mode open when the rename fails', async () => {
    updateOneRecord.mockRejectedValueOnce(new Error('Forbidden'));

    const { result } = renderRename(
      buildThread({ id: 'thread-fail', title: 'Old' }),
    );

    startRename('thread-fail');

    await act(async () => {
      await result.current.commitRename('New title');
    });

    expectRenamedTo(updateOneRecord, 'thread-fail', 'New title');
    expect(result.current.isRenaming).toBe(true);
  });

  it('starts from the current title again after a rename ended from another chat', () => {
    const { result } = renderRename(buildThread({ title: 'Existing title' }));

    startRename('thread-1');
    act(() => {
      result.current.setDraftTitle('Abandoned draft');
    });
    startRename('thread-2');
    startRename('thread-1');

    expect(result.current.draftTitle).toBe('Existing title');
  });

  it('leaves a rename started on another chat open when an earlier save ends', async () => {
    let resolveUpdate: (value: unknown) => void = () => {};
    updateOneRecord.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveUpdate = resolve;
      }),
    );

    const { result } = renderRename(
      buildThread({ id: 'thread-1', title: 'Old' }),
    );

    startRename('thread-1');

    let commitPromise: Promise<void> = Promise.resolve();
    act(() => {
      commitPromise = result.current.commitRename('New title');
    });

    startRename('thread-2');

    await act(async () => {
      resolveUpdate({});
      await commitPromise;
    });

    expect(
      jotaiStore.get(
        aiChatThreadIdBeingRenamedComponentState.atomFamily({
          instanceId: commandMenuInstanceId,
        }),
      ),
    ).toBe('thread-2');
  });

  it('treats a null current title as empty when comparing against committed input', async () => {
    const { result } = renderRename(
      buildThread({ id: 'thread-9', title: null }),
    );

    await act(async () => {
      await result.current.commitRename('First name');
    });

    expectRenamedTo(updateOneRecord, 'thread-9', 'First name');
  });
});
