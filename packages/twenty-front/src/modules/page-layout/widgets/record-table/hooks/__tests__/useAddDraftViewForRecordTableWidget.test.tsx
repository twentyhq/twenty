import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import { useAddDraftViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useAddDraftViewForRecordTableWidget';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const PAGE_LAYOUT_ID = 'page-layout-id';
const WIDGET_ID = 'widget-id';

const getWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

describe('useAddDraftViewForRecordTableWidget', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('merges the new view id into the latest widget configuration', () => {
    let scheduledFrame: FrameRequestCallback | undefined;

    jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        scheduledFrame = callback;
        return 1;
      });

    const store = createStore();
    const pageLayoutDraftState = pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_ID,
    });

    const recordTableWidget = buildDraftPageLayoutWidget({
      id: WIDGET_ID,
      pageLayoutTabId: 'tab-id',
      title: 'Companies',
      type: WidgetType.RECORD_TABLE,
      objectMetadataId: 'object-metadata-id',
      position: {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 0,
        column: 0,
        rowSpan: 4,
        columnSpan: 4,
      },
      configuration: {
        configurationType: WidgetConfigurationType.RECORD_TABLE,
        viewId: 'previous-view-id',
        recordLimit: 12,
        isUIEditable: true,
      },
    });

    store.set(
      pageLayoutDraftState,
      makeDraft([makeTab('tab-id', [recordTableWidget])]),
    );

    const { result } = renderHook(
      () => useAddDraftViewForRecordTableWidget(PAGE_LAYOUT_ID),
      { wrapper: getWrapper(store) },
    );

    act(() => {
      result.current.addDraftViewForRecordTableWidget(
        WIDGET_ID,
        getMockObjectMetadataItemOrThrow('company'),
      );
    });

    act(() => {
      store.set(pageLayoutDraftState, (previousDraft) => ({
        ...previousDraft,
        tabs: previousDraft.tabs.map((tab) => ({
          ...tab,
          widgets: tab.widgets.map((widget) =>
            widget.id === WIDGET_ID
              ? {
                  ...widget,
                  configuration: {
                    ...widget.configuration,
                    isUIEditable: false,
                  },
                }
              : widget,
          ),
        })),
      }));
    });

    expect(scheduledFrame).toBeDefined();

    act(() => {
      scheduledFrame?.(0);
    });

    const updatedWidget = store
      .get(pageLayoutDraftState)
      .tabs.flatMap((tab) => tab.widgets)
      .find((widget) => widget.id === WIDGET_ID);

    const newViewId = store.get(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
    )[WIDGET_ID].view.id;

    expect(updatedWidget?.configuration).toEqual({
      configurationType: WidgetConfigurationType.RECORD_TABLE,
      viewId: newViewId,
      recordLimit: 12,
      isUIEditable: false,
    });
  });
});
