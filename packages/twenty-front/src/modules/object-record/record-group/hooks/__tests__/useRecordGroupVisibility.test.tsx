import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { recordIndexGroupLoadLimitComponentState } from '@/object-record/record-index/states/recordIndexGroupLoadLimitComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

const updateCurrentViewMock = jest.fn();

jest.mock('@/views/hooks/useUpdateCurrentView', () => ({
  useUpdateCurrentView: () => ({
    updateCurrentView: updateCurrentViewMock,
  }),
}));

jest.mock('@/views/hooks/useSaveCurrentViewGroups', () => ({
  useSaveCurrentViewGroups: () => ({
    saveViewGroup: jest.fn(),
  }),
}));

const INSTANCE_ID = 'view-instance-id';

const getWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <ViewComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        {children}
      </ViewComponentInstanceContext.Provider>
    </JotaiProvider>
  );

const groupLoadLimitAtom = recordIndexGroupLoadLimitComponentState.atomFamily({
  instanceId: INSTANCE_ID,
});

const createDeferredViewUpdate = () => {
  let resolveViewUpdate!: () => void;
  let rejectViewUpdate!: (error: Error) => void;

  const promise = new Promise<void>((resolve, reject) => {
    resolveViewUpdate = resolve;
    rejectViewUpdate = reject;
  });

  return { promise, resolveViewUpdate, rejectViewUpdate };
};

describe('useRecordGroupVisibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should keep the new group load limit when the view update succeeds', async () => {
    const store = createStore();
    store.set(groupLoadLimitAtom, 8);
    updateCurrentViewMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRecordGroupVisibility(), {
      wrapper: getWrapper(store),
    });

    await act(async () => {
      await result.current.handleGroupLoadLimitChange(50);
    });

    expect(updateCurrentViewMock).toHaveBeenCalledWith({
      groupLoadLimit: 50,
    });
    expect(store.get(groupLoadLimitAtom)).toBe(50);
  });

  it('should restore the previous group load limit when the view update fails', async () => {
    const store = createStore();
    store.set(groupLoadLimitAtom, 8);
    updateCurrentViewMock.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRecordGroupVisibility(), {
      wrapper: getWrapper(store),
    });

    await act(async () => {
      await expect(
        result.current.handleGroupLoadLimitChange(50),
      ).rejects.toThrow('Network error');
    });

    expect(store.get(groupLoadLimitAtom)).toBe(8);
  });

  it('should keep the newest group load limit when an older request fails afterwards', async () => {
    const store = createStore();
    store.set(groupLoadLimitAtom, 8);

    const olderViewUpdate = createDeferredViewUpdate();
    const newerViewUpdate = createDeferredViewUpdate();

    updateCurrentViewMock
      .mockImplementationOnce(() => olderViewUpdate.promise)
      .mockImplementationOnce(() => newerViewUpdate.promise);

    const { result } = renderHook(() => useRecordGroupVisibility(), {
      wrapper: getWrapper(store),
    });

    let olderCall!: Promise<void>;
    let newerCall!: Promise<void>;

    act(() => {
      olderCall = result.current.handleGroupLoadLimitChange(25);
      newerCall = result.current.handleGroupLoadLimitChange(50);
    });

    const olderCallAssertion =
      expect(olderCall).rejects.toThrow('Network error');

    await act(async () => {
      newerViewUpdate.resolveViewUpdate();
      await newerCall;
    });

    await act(async () => {
      olderViewUpdate.rejectViewUpdate(new Error('Network error'));
      await olderCallAssertion;
    });

    expect(store.get(groupLoadLimitAtom)).toBe(50);
  });

  it('should keep the newest group load limit when an older request fails while the newer one is still in flight', async () => {
    const store = createStore();
    store.set(groupLoadLimitAtom, 8);

    const olderViewUpdate = createDeferredViewUpdate();
    const newerViewUpdate = createDeferredViewUpdate();

    updateCurrentViewMock
      .mockImplementationOnce(() => olderViewUpdate.promise)
      .mockImplementationOnce(() => newerViewUpdate.promise);

    const { result } = renderHook(() => useRecordGroupVisibility(), {
      wrapper: getWrapper(store),
    });

    let olderCall!: Promise<void>;
    let newerCall!: Promise<void>;

    act(() => {
      olderCall = result.current.handleGroupLoadLimitChange(25);
      newerCall = result.current.handleGroupLoadLimitChange(50);
    });

    const olderCallAssertion =
      expect(olderCall).rejects.toThrow('Network error');

    await act(async () => {
      olderViewUpdate.rejectViewUpdate(new Error('Network error'));
      await olderCallAssertion;
    });

    expect(store.get(groupLoadLimitAtom)).toBe(50);

    await act(async () => {
      newerViewUpdate.resolveViewUpdate();
      await newerCall;
    });

    expect(store.get(groupLoadLimitAtom)).toBe(50);
  });

  it('should restore the last saved group load limit when consecutive requests both fail', async () => {
    const store = createStore();
    store.set(groupLoadLimitAtom, 8);

    const olderViewUpdate = createDeferredViewUpdate();
    const newerViewUpdate = createDeferredViewUpdate();

    updateCurrentViewMock
      .mockImplementationOnce(() => olderViewUpdate.promise)
      .mockImplementationOnce(() => newerViewUpdate.promise);

    const { result } = renderHook(() => useRecordGroupVisibility(), {
      wrapper: getWrapper(store),
    });

    let olderCall!: Promise<void>;
    let newerCall!: Promise<void>;

    act(() => {
      olderCall = result.current.handleGroupLoadLimitChange(25);
      newerCall = result.current.handleGroupLoadLimitChange(50);
    });

    const olderCallAssertion =
      expect(olderCall).rejects.toThrow('Network error');
    const newerCallAssertion =
      expect(newerCall).rejects.toThrow('Network error');

    await act(async () => {
      olderViewUpdate.rejectViewUpdate(new Error('Network error'));
      await olderCallAssertion;
    });

    await act(async () => {
      newerViewUpdate.rejectViewUpdate(new Error('Network error'));
      await newerCallAssertion;
    });

    expect(store.get(groupLoadLimitAtom)).toBe(8);
  });

  it('should restore an older saved group load limit when the newer request fails after it', async () => {
    const store = createStore();
    store.set(groupLoadLimitAtom, 8);

    const olderViewUpdate = createDeferredViewUpdate();
    const newerViewUpdate = createDeferredViewUpdate();

    updateCurrentViewMock
      .mockImplementationOnce(() => olderViewUpdate.promise)
      .mockImplementationOnce(() => newerViewUpdate.promise);

    const { result } = renderHook(() => useRecordGroupVisibility(), {
      wrapper: getWrapper(store),
    });

    let olderCall!: Promise<void>;
    let newerCall!: Promise<void>;

    act(() => {
      olderCall = result.current.handleGroupLoadLimitChange(25);
      newerCall = result.current.handleGroupLoadLimitChange(50);
    });

    const newerCallAssertion =
      expect(newerCall).rejects.toThrow('Network error');

    await act(async () => {
      olderViewUpdate.resolveViewUpdate();
      await olderCall;
    });

    await act(async () => {
      newerViewUpdate.rejectViewUpdate(new Error('Network error'));
      await newerCallAssertion;
    });

    expect(store.get(groupLoadLimitAtom)).toBe(25);
  });
});
