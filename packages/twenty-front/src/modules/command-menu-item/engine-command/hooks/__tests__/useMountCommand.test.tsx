import { headlessCommandContextApisState } from '@/command-menu-item/engine-command/states/headlessCommandContextApisState';
import { type HeadlessEngineCommandContextApi } from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { useMountCommand } from '@/command-menu-item/engine-command/hooks/useMountCommand';
import { renderHook, act } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

const mockEnrichFn = jest.fn();

jest.mock(
  '@/command-menu-item/engine-command/hooks/useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation',
  () => ({
    useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation:
      () => ({
        enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation:
          mockEnrichFn,
      }),
  }),
);

const baseContextApi: HeadlessEngineCommandContextApi = {
  engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
  contextStoreInstanceId: 'ctx-1',
  objectMetadataItem: null,
  currentViewId: null,
  recordIndexId: null,
  targetedRecordsRule: { mode: 'selection', selectedRecordIds: [] },
  selectedRecords: [],
  graphqlFilter: null,
  payload: null,
};

jest.mock(
  '@/command-menu-item/engine-command/utils/buildHeadlessCommandContextApi',
  () => ({
    buildHeadlessCommandContextApi: () => baseContextApi,
  }),
);

const getWrapper =
  (store = createStore()) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

describe('useMountCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mount with frontComponentId when provided', async () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const { result } = renderHook(() => useMountCommand(), { wrapper });

    await act(async () => {
      await result.current({
        engineCommandId: 'cmd-1',
        contextStoreInstanceId: 'ctx-1',
        engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
        frontComponentId: 'front-comp-1',
      });
    });

    const map = store.get(headlessCommandContextApisState.atom);

    expect(map.get('cmd-1')).toEqual({
      ...baseContextApi,
      frontComponentId: 'front-comp-1',
    });
    expect(mockEnrichFn).not.toHaveBeenCalled();
  });

  it('should mount with workflow enrichment when workflowVersionId and availabilityType are provided', async () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const enrichedState = {
      ...baseContextApi,
      workflowId: 'workflow-1',
      workflowVersionId: 'wf-version-1',
      trigger: { type: 'MANUAL' },
      availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    };
    mockEnrichFn.mockResolvedValue(enrichedState);

    const { result } = renderHook(() => useMountCommand(), { wrapper });

    await act(async () => {
      await result.current({
        engineCommandId: 'cmd-1',
        contextStoreInstanceId: 'ctx-1',
        engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
        workflowVersionId: 'wf-version-1',
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      });
    });

    const map = store.get(headlessCommandContextApisState.atom);

    expect(map.get('cmd-1')).toEqual(enrichedState);
    expect(mockEnrichFn).toHaveBeenCalledWith({
      headlessEngineCommandContextApi: baseContextApi,
      workflowVersionId: 'wf-version-1',
      availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      availabilityObjectMetadataId: undefined,
    });
  });

  it('should mount with base headless context API when neither frontComponentId nor workflow params are provided', async () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const { result } = renderHook(() => useMountCommand(), { wrapper });

    await act(async () => {
      await result.current({
        engineCommandId: 'cmd-1',
        contextStoreInstanceId: 'ctx-1',
        engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
      });
    });

    const map = store.get(headlessCommandContextApisState.atom);

    expect(map.get('cmd-1')).toEqual(baseContextApi);
    expect(mockEnrichFn).not.toHaveBeenCalled();
  });

  it('should not set state when workflow enrichment returns undefined', async () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    mockEnrichFn.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMountCommand(), { wrapper });

    await act(async () => {
      await result.current({
        engineCommandId: 'cmd-1',
        contextStoreInstanceId: 'ctx-1',
        engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
        workflowVersionId: 'wf-version-1',
        availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
      });
    });

    const map = store.get(headlessCommandContextApisState.atom);

    expect(map.has('cmd-1')).toBe(false);
  });
});
