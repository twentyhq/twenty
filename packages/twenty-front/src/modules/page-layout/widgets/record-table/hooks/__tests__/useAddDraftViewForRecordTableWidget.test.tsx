import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useAddDraftViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useAddDraftViewForRecordTableWidget';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import {
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

    const recordTableWidget = {
      ...makeWidget(WIDGET_ID, 0),
      type: WidgetType.RECORD_TABLE,
      configuration: {
        __typename: 'RecordTableConfiguration' as const,
        configurationType: WidgetConfigurationType.RECORD_TABLE,
        viewId: 'previous-view-id',
        recordLimit: 12,
        isUIEditable: false,
        viewerControls: {
          filter: true,
          sort: false,
        },
      },
    } as unknown as PageLayoutWidget;

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

    // A setting can change before the deferred view-id update runs. The frame
    // must merge into this current value rather than the invocation-time value.
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
                    viewerControls: {
                      ...('viewerControls' in widget.configuration
                        ? widget.configuration.viewerControls
                        : undefined),
                      sort: true,
                    },
                  } as PageLayoutWidget['configuration'],
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
      __typename: 'RecordTableConfiguration',
      configurationType: WidgetConfigurationType.RECORD_TABLE,
      viewId: newViewId,
      recordLimit: 12,
      isUIEditable: false,
      viewerControls: {
        filter: true,
        sort: true,
      },
    });
  });
});
