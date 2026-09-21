import { act, renderHook } from '@testing-library/react';

import { useRecordSeededDraft } from '@/object-record/record-seeded-draft/hooks/useRecordSeededDraft';

type DraftProps = {
  subject: string;
  resetKey?: string;
};

const mockPersist = jest.fn();

const renderDraftHook = (initialProps: DraftProps) =>
  renderHook(
    ({ subject, resetKey }: DraftProps) =>
      useRecordSeededDraft({
        upstreamDraft: { subject },
        onPersist: mockPersist,
        resetKey,
      }),
    { initialProps },
  );

describe('useRecordSeededDraft', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should adopt a remote change when the draft is pristine', () => {
    const { result, rerender } = renderDraftHook({ subject: '' });

    const initialResyncKey = result.current.draftResyncKey;

    rerender({ subject: 'Written remotely' });

    expect(result.current.draft.subject).toBe('Written remotely');
    expect(result.current.draftResyncKey).not.toBe(initialResyncKey);
  });

  it('should keep the local draft when its own persist echoes back', () => {
    const { result, rerender } = renderDraftHook({ subject: '' });

    act(() => {
      result.current.updateDraft({ subject: 'Typed locally' });
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockPersist).toHaveBeenCalledWith({ subject: 'Typed locally' });

    const resyncKeyBeforeEcho = result.current.draftResyncKey;

    rerender({ subject: 'Typed locally' });

    expect(result.current.draft.subject).toBe('Typed locally');
    expect(result.current.draftResyncKey).toBe(resyncKeyBeforeEcho);
  });

  it('should let unsaved local edits win over a concurrent remote change', () => {
    const { result, rerender } = renderDraftHook({ subject: '' });

    act(() => {
      result.current.updateDraft({ subject: 'Typed locally' });
    });

    rerender({ subject: 'Concurrent remote change' });

    expect(result.current.draft.subject).toBe('Typed locally');
    expect(result.current.isDirty).toBe(true);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockPersist).toHaveBeenCalledWith({ subject: 'Typed locally' });
  });

  it('should adopt a remote change arriving after local edits were persisted and echoed', () => {
    const { result, rerender } = renderDraftHook({ subject: '' });

    act(() => {
      result.current.updateDraft({ subject: 'Typed locally' });
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    rerender({ subject: 'Typed locally' });

    const resyncKeyAfterEcho = result.current.draftResyncKey;

    rerender({ subject: 'Updated remotely afterwards' });

    expect(result.current.draft.subject).toBe('Updated remotely afterwards');
    expect(result.current.draftResyncKey).not.toBe(resyncKeyAfterEcho);
  });

  it('should flush the pending persist on unmount', () => {
    const { result, unmount } = renderDraftHook({ subject: '' });

    act(() => {
      result.current.updateDraft({ subject: 'Typed then navigated away' });
    });

    unmount();

    expect(mockPersist).toHaveBeenCalledWith({
      subject: 'Typed then navigated away',
    });
  });

  it('should reseed and drop the pending persist when the reset key changes', () => {
    const { result, rerender } = renderDraftHook({
      subject: 'First record body',
      resetKey: 'record-1',
    });

    act(() => {
      result.current.updateDraft({ subject: 'Edited on first record' });
    });

    const resyncKeyBeforeReset = result.current.draftResyncKey;

    rerender({ subject: 'Second record body', resetKey: 'record-2' });

    expect(result.current.draft.subject).toBe('Second record body');
    expect(result.current.draftResyncKey).not.toBe(resyncKeyBeforeReset);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockPersist).not.toHaveBeenCalled();
  });

  it('should drop a pending persist when the reset key cycles back within the debounce', () => {
    const { result, rerender } = renderDraftHook({
      subject: 'Record A body',
      resetKey: 'record-a',
    });

    act(() => {
      result.current.updateDraft({ subject: 'Edited on record A' });
    });

    rerender({ subject: 'Record B body', resetKey: 'record-b' });
    rerender({ subject: 'Record A body', resetKey: 'record-a' });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockPersist).not.toHaveBeenCalled();
    expect(result.current.draft.subject).toBe('Record A body');
  });

  it('should hold off adoption between markDirty and the serialized update', () => {
    const { result, rerender } = renderDraftHook({ subject: 'Initial' });

    act(() => {
      result.current.markDirty();
    });

    expect(result.current.isDirty).toBe(true);

    rerender({ subject: 'Remote change during serialization' });

    expect(result.current.draft.subject).toBe('Initial');

    act(() => {
      result.current.updateDraft({ subject: 'Serialized local edit' });
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockPersist).toHaveBeenCalledWith({
      subject: 'Serialized local edit',
    });
  });

  it('should report a pristine draft as not dirty', () => {
    const { result, rerender } = renderDraftHook({ subject: 'Initial' });

    expect(result.current.isDirty).toBe(false);

    rerender({ subject: 'Remote change' });

    expect(result.current.isDirty).toBe(false);
  });
});
