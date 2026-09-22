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

const shouldHideEmptyGroupsAtom =
  recordIndexShouldHideEmptyRecordGroupsComponentState.atomFamily({
    instanceId: INSTANCE_ID,
  });

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

  it('should restore the previous hide-empty-groups state when the view update fails', async () => {
    const store = createStore();
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
