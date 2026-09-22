import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { recordIndexGroupLoadLimitComponentState } from '@/object-record/record-index/states/recordIndexGroupLoadLimitComponentState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
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
const CONTEXT_STORE_INSTANCE_ID = 'context-store-instance-id';

const getWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: CONTEXT_STORE_INSTANCE_ID }}
      >
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: INSTANCE_ID }}
        >
          {children}
        </ViewComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </JotaiProvider>
  );

const groupLoadLimitAtom = recordIndexGroupLoadLimitComponentState.atomFamily({
  instanceId: INSTANCE_ID,
});

const shouldHideEmptyGroupsAtom =
  recordIndexShouldHideEmptyRecordGroupsComponentState.atomFamily({
    instanceId: INSTANCE_ID,
  });

const currentViewIdAtom = contextStoreCurrentViewIdComponentState.atomFamily({
  instanceId: CONTEXT_STORE_INSTANCE_ID,
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

const createStoreWithCurrentView = () => {
  const store = createStore();

  store.set(currentViewIdAtom, 'view-id');

  return store;
};

describe('useRecordGroupVisibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should keep the new group load limit when the view update succeeds', async () => {
    const store = createStoreWithCurrentView();
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
    const store = createStoreWithCurrentView();
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

  it('should save the last group load limit after the in-flight save when choices are made quickly', async () => {
    const store = createStoreWithCurrentView();
    store.set(groupLoadLimitAtom, 8);

    const firstViewUpdate = createDeferredViewUpdate();

    updateCurrentViewMock
      .mockImplementationOnce(() => firstViewUpdate.promise)
      .mockResolvedValue(undefined);

    const { result } = renderHook(() => useRecordGroupVisibility(), {
      wrapper: getWrapper(store),
    });

    let choices!: Promise<void>[];

    act(() => {
      choices = [25, 50, 8, 25].map((limit) =>
        result.current.handleGroupLoadLimitChange(limit),
      );
    });

    expect(updateCurrentViewMock.mock.calls).toEqual([
      [{ groupLoadLimit: 25 }],
    ]);
    expect(store.get(groupLoadLimitAtom)).toBe(25);

    await act(async () => {
      firstViewUpdate.resolveViewUpdate();
      await Promise.all(choices);
    });

    expect(updateCurrentViewMock.mock.calls).toEqual([
      [{ groupLoadLimit: 25 }],
      [{ groupLoadLimit: 25 }],
    ]);
    expect(store.get(groupLoadLimitAtom)).toBe(25);
  });

  it('should restore the last saved group load limit when the latest save fails', async () => {
    const store = createStoreWithCurrentView();
    store.set(groupLoadLimitAtom, 8);

    const firstViewUpdate = createDeferredViewUpdate();

    updateCurrentViewMock
      .mockImplementationOnce(() => firstViewUpdate.promise)
      .mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useRecordGroupVisibility(), {
      wrapper: getWrapper(store),
    });

    let firstCall!: Promise<void>;
    let secondCall!: Promise<void>;
    let latestCall!: Promise<void>;

    act(() => {
      firstCall = result.current.handleGroupLoadLimitChange(25);
      secondCall = result.current.handleGroupLoadLimitChange(50);
      latestCall = result.current.handleGroupLoadLimitChange(100);
    });

    const latestCallAssertion =
      expect(latestCall).rejects.toThrow('Network error');

    await act(async () => {
      firstViewUpdate.resolveViewUpdate();
      await Promise.all([firstCall, secondCall, latestCallAssertion]);
    });

    expect(updateCurrentViewMock.mock.calls).toEqual([
      [{ groupLoadLimit: 25 }],
      [{ groupLoadLimit: 100 }],
    ]);
    expect(store.get(groupLoadLimitAtom)).toBe(25);
  });

  it('should keep the newest group load limit when an older request fails while the newer one is queued', async () => {
    const store = createStoreWithCurrentView();
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
    expect(updateCurrentViewMock).toHaveBeenLastCalledWith({
      groupLoadLimit: 50,
    });

    await act(async () => {
      newerViewUpdate.resolveViewUpdate();
      await newerCall;
    });

    expect(store.get(groupLoadLimitAtom)).toBe(50);
  });

  it('should keep the newest group load limit when a request from an unmounted menu fails afterwards', async () => {
    const store = createStoreWithCurrentView();
    store.set(groupLoadLimitAtom, 8);

    const olderViewUpdate = createDeferredViewUpdate();

    updateCurrentViewMock
      .mockImplementationOnce(() => olderViewUpdate.promise)
      .mockResolvedValueOnce(undefined);

    const { result: firstMenu, unmount: unmountFirstMenu } = renderHook(
      () => useRecordGroupVisibility(),
      { wrapper: getWrapper(store) },
    );

    let olderCall!: Promise<void>;

    act(() => {
      olderCall = firstMenu.current.handleGroupLoadLimitChange(25);
    });

    const olderCallAssertion =
      expect(olderCall).rejects.toThrow('Network error');

    unmountFirstMenu();

    const { result: secondMenu } = renderHook(
      () => useRecordGroupVisibility(),
      { wrapper: getWrapper(store) },
    );

    let newerCall!: Promise<void>;

    act(() => {
      newerCall = secondMenu.current.handleGroupLoadLimitChange(50);
    });

    await act(async () => {
      olderViewUpdate.rejectViewUpdate(new Error('Network error'));
      await Promise.all([olderCallAssertion, newerCall]);
    });

    expect(updateCurrentViewMock).toHaveBeenLastCalledWith({
      groupLoadLimit: 50,
    });
    expect(store.get(groupLoadLimitAtom)).toBe(50);
  });

  it('should not save a queued group load limit on a view the user switched to', async () => {
    const store = createStoreWithCurrentView();
    store.set(groupLoadLimitAtom, 8);

    const firstViewUpdate = createDeferredViewUpdate();

    updateCurrentViewMock.mockImplementationOnce(() => firstViewUpdate.promise);

    const { result } = renderHook(() => useRecordGroupVisibility(), {
      wrapper: getWrapper(store),
    });

    let choices!: Promise<void>[];

    act(() => {
      choices = [25, 50].map((limit) =>
        result.current.handleGroupLoadLimitChange(limit),
      );
    });

    store.set(currentViewIdAtom, 'other-view-id');

    await act(async () => {
      firstViewUpdate.resolveViewUpdate();
      await Promise.all(choices);
    });

    expect(updateCurrentViewMock.mock.calls).toEqual([
      [{ groupLoadLimit: 25 }],
    ]);
  });

  it('should save the last hide-empty-groups state after the in-flight save when toggled quickly', async () => {
    const store = createStoreWithCurrentView();
    store.set(shouldHideEmptyGroupsAtom, false);

    const firstViewUpdate = createDeferredViewUpdate();

    updateCurrentViewMock
      .mockImplementationOnce(() => firstViewUpdate.promise)
      .mockResolvedValue(undefined);

    const { result } = renderHook(() => useRecordGroupVisibility(), {
      wrapper: getWrapper(store),
    });

    let toggles!: Promise<void>[];

    act(() => {
      toggles = [1, 2, 3, 4, 5].map(() =>
        result.current.handleHideEmptyRecordGroupChange(),
      );
    });

    await act(async () => {
      firstViewUpdate.resolveViewUpdate();
      await Promise.all(toggles);
    });

    expect(updateCurrentViewMock.mock.calls).toEqual([
      [{ shouldHideEmptyGroups: true }],
      [{ shouldHideEmptyGroups: true }],
    ]);
    expect(store.get(shouldHideEmptyGroupsAtom)).toBe(true);
  });

  it('should keep the newest hide-empty-groups state when a request from an unmounted menu fails afterwards', async () => {
    const store = createStoreWithCurrentView();
    store.set(shouldHideEmptyGroupsAtom, false);

    const firstViewUpdate = createDeferredViewUpdate();

    updateCurrentViewMock
      .mockImplementationOnce(() => firstViewUpdate.promise)
      .mockResolvedValue(undefined);

    const { result: firstMenu, unmount: unmountFirstMenu } = renderHook(
      () => useRecordGroupVisibility(),
      { wrapper: getWrapper(store) },
    );

    let firstCall!: Promise<void>;

    act(() => {
      firstCall = firstMenu.current.handleHideEmptyRecordGroupChange();
    });

    const firstCallAssertion =
      expect(firstCall).rejects.toThrow('Network error');

    unmountFirstMenu();

    const { result: secondMenu } = renderHook(
      () => useRecordGroupVisibility(),
      { wrapper: getWrapper(store) },
    );

    let newerCalls!: Promise<void>[];

    act(() => {
      newerCalls = [
        secondMenu.current.handleHideEmptyRecordGroupChange(),
        secondMenu.current.handleHideEmptyRecordGroupChange(),
      ];
    });

    await act(async () => {
      firstViewUpdate.rejectViewUpdate(new Error('Network error'));
      await Promise.all([firstCallAssertion, ...newerCalls]);
    });

    expect(updateCurrentViewMock).toHaveBeenLastCalledWith({
      shouldHideEmptyGroups: true,
    });
    expect(store.get(shouldHideEmptyGroupsAtom)).toBe(true);
  });

  it('should restore the previous hide-empty-groups state when the view update fails', async () => {
    const store = createStoreWithCurrentView();
    store.set(shouldHideEmptyGroupsAtom, false);
    updateCurrentViewMock.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRecordGroupVisibility(), {
      wrapper: getWrapper(store),
    });

    await act(async () => {
      await expect(
        result.current.handleHideEmptyRecordGroupChange(),
      ).rejects.toThrow('Network error');
    });

    expect(store.get(shouldHideEmptyGroupsAtom)).toBe(false);
  });
});
