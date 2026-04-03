import { headlessCommandContextApisState } from '@/command-menu-item/engine-command/states/headlessCommandContextApisState';
import { type HeadlessEngineCommandContextApi } from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { EngineComponentKey } from '~/generated-metadata/graphql';

const TEST_ENGINE_COMMAND_ID = 'test-engine-cmd-1';

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({
    useAvailableComponentInstanceIdOrThrow: () => TEST_ENGINE_COMMAND_ID,
  }),
);

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

describe('useHeadlessCommandContextApi', () => {
  it('should return the HeadlessCommandContextApi for the current instance id', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const contextApi = buildHeadlessContextApi();
    store.set(
      headlessCommandContextApisState.atom,
      new Map([[TEST_ENGINE_COMMAND_ID, contextApi]]),
    );

    const { result } = renderHook(() => useHeadlessCommandContextApi(), {
      wrapper,
    });

    expect(result.current).toEqual(contextApi);
  });

  it('should throw when no entry exists for the instance id', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(headlessCommandContextApisState.atom, new Map());

    expect(() =>
      renderHook(() => useHeadlessCommandContextApi(), { wrapper }),
    ).toThrow(
      'Headless command context API not found. Make sure the command was mounted via the command mount flow.',
    );
  });
});
