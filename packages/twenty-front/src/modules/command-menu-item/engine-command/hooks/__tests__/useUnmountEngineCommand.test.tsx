import { headlessCommandContextApisState } from '@/command-menu-item/engine-command/states/headlessCommandContextApisState';
import { type HeadlessEngineCommandContextApi } from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { useUnmountCommand } from '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { renderHook, act } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { EngineComponentKey } from '~/generated-metadata/graphql';

const getWrapper =
  (store = createStore()) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

const buildHeadlessContextApi = (
  overrides: Partial<HeadlessEngineCommandContextApi> = {},
): HeadlessEngineCommandContextApi => ({
  engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
  contextStoreInstanceId: 'ctx-1',
  objectMetadataItem: null,
  currentViewId: null,
  recordIndexId: null,
  targetedRecordsRule: { mode: 'selection', selectedRecordIds: [] },
  selectedRecords: [],
  graphqlFilter: null,
  ...overrides,
});

describe('useUnmountCommand', () => {
  it('should remove entry from headlessCommandContextApisState map', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const contextApi = buildHeadlessContextApi();
    store.set(
      headlessCommandContextApisState.atom,
      new Map([['cmd-1', contextApi]]),
    );

    const { result } = renderHook(() => useUnmountCommand(), { wrapper });

    act(() => {
      result.current('cmd-1');
    });

    const map = store.get(headlessCommandContextApisState.atom);

    expect(map.has('cmd-1')).toBe(false);
    expect(map.size).toBe(0);
  });

  it('should reset commandMenuItemProgressFamilyState for the given id to undefined', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(commandMenuItemProgressFamilyState.atomFamily('cmd-1'), 50);

    const { result } = renderHook(() => useUnmountCommand(), { wrapper });

    act(() => {
      result.current('cmd-1');
    });

    const progress = store.get(
      commandMenuItemProgressFamilyState.atomFamily('cmd-1'),
    );

    expect(progress).toBeUndefined();
  });

  it('should not affect other entries in the map', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const contextApi1 = buildHeadlessContextApi({
      contextStoreInstanceId: 'ctx-1',
    });
    const contextApi2 = buildHeadlessContextApi({
      contextStoreInstanceId: 'ctx-2',
    });

    store.set(
      headlessCommandContextApisState.atom,
      new Map([
        ['cmd-1', contextApi1],
        ['cmd-2', contextApi2],
      ]),
    );

    const { result } = renderHook(() => useUnmountCommand(), { wrapper });

    act(() => {
      result.current('cmd-1');
    });

    const map = store.get(headlessCommandContextApisState.atom);

    expect(map.has('cmd-1')).toBe(false);
    expect(map.has('cmd-2')).toBe(true);
    expect(map.get('cmd-2')).toEqual(contextApi2);
  });
});
