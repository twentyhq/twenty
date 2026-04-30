import { act, renderHook } from '@testing-library/react';

import { useAiChatThreadRename } from '@/ai/hooks/useAiChatThreadRename';
import { useRenameChatThread } from '@/ai/hooks/useRenameChatThread';
import { type AgentChatThread } from '~/generated-metadata/graphql';

jest.mock('@/ai/hooks/useRenameChatThread');

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

describe('useAiChatThreadRename', () => {
  const renameChatThread = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    renameChatThread.mockResolvedValue(true);
    (useRenameChatThread as jest.Mock).mockReturnValue({ renameChatThread });
  });

  it('starts in non-renaming state with the current thread title as draft', () => {
    const { result } = renderHook(() =>
      useAiChatThreadRename(buildThread({ title: 'Existing title' })),
    );

    expect(result.current.isRenaming).toBe(false);
    expect(result.current.draftTitle).toBe('Existing title');
  });

  it('falls back to empty string when the thread title is null', () => {
    const { result } = renderHook(() =>
      useAiChatThreadRename(buildThread({ title: null })),
    );

    expect(result.current.draftTitle).toBe('');
  });

  it('enters renaming mode and re-seeds draft from current title on startRename', () => {
    const { result } = renderHook(() =>
      useAiChatThreadRename(buildThread({ title: 'Existing title' })),
    );

    act(() => {
      result.current.setDraftTitle('Stale draft');
    });
    act(() => {
      result.current.startRename();
    });

    expect(result.current.isRenaming).toBe(true);
    expect(result.current.draftTitle).toBe('Existing title');
  });

  it('exits renaming mode and resets the draft on cancelRename', () => {
    const { result } = renderHook(() =>
      useAiChatThreadRename(buildThread({ title: 'Existing title' })),
    );

    act(() => {
      result.current.startRename();
      result.current.setDraftTitle('Edited draft');
    });
    act(() => {
      result.current.cancelRename();
    });

    expect(result.current.isRenaming).toBe(false);
    expect(result.current.draftTitle).toBe('Existing title');
  });

  it('skips renaming when committed title is empty after trim', async () => {
    const { result } = renderHook(() =>
      useAiChatThreadRename(buildThread({ title: 'Existing title' })),
    );

    await act(async () => {
      await result.current.commitRename('   ');
    });

    expect(renameChatThread).not.toHaveBeenCalled();
    expect(result.current.isRenaming).toBe(false);
  });

  it('skips renaming when committed title equals the current title', async () => {
    const { result } = renderHook(() =>
      useAiChatThreadRename(buildThread({ title: 'Existing title' })),
    );

    await act(async () => {
      await result.current.commitRename('Existing title');
    });

    expect(renameChatThread).not.toHaveBeenCalled();
  });

  it('trims surrounding whitespace before comparing to the current title', async () => {
    const { result } = renderHook(() =>
      useAiChatThreadRename(buildThread({ title: 'Existing title' })),
    );

    await act(async () => {
      await result.current.commitRename('  Existing title  ');
    });

    expect(renameChatThread).not.toHaveBeenCalled();
  });

  it('renames with the trimmed title when it differs from the current one', async () => {
    const { result } = renderHook(() =>
      useAiChatThreadRename(
        buildThread({ id: 'thread-7', title: 'Old title' }),
      ),
    );

    await act(async () => {
      await result.current.commitRename('  New title  ');
    });

    expect(renameChatThread).toHaveBeenCalledWith('thread-7', 'New title');
    expect(result.current.isRenaming).toBe(false);
  });

  it('keeps renaming mode open when the rename mutation reports failure', async () => {
    renameChatThread.mockResolvedValueOnce(false);

    const { result } = renderHook(() =>
      useAiChatThreadRename(buildThread({ id: 'thread-fail', title: 'Old' })),
    );

    act(() => {
      result.current.startRename();
    });

    await act(async () => {
      await result.current.commitRename('New title');
    });

    expect(renameChatThread).toHaveBeenCalledWith('thread-fail', 'New title');
    expect(result.current.isRenaming).toBe(true);
  });

  it('treats a null current title as empty when comparing against committed input', async () => {
    const { result } = renderHook(() =>
      useAiChatThreadRename(buildThread({ id: 'thread-9', title: null })),
    );

    await act(async () => {
      await result.current.commitRename('First name');
    });

    expect(renameChatThread).toHaveBeenCalledWith('thread-9', 'First name');
  });
});
