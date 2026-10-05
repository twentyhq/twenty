import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewPersistedComponentState } from '@/page-layout/states/recordTableWidgetViewPersistedComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { useInitializeRecordTableWidgetViewDrafts } from '@/page-layout/widgets/record-table/hooks/useInitializeRecordTableWidgetViewDrafts';
import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { constructViewFromRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/constructViewFromRecordTableWidgetViewSnapshot';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const view = constructViewFromRecordTableWidgetViewSnapshot(
  buildRecordTableWidgetViewSnapshot(
    getMockObjectMetadataItemOrThrow('company'),
  ),
);

jest.mock('@/views/states/selectors/viewsSelector', () => {
  const { atom } = jest.requireActual('jotai');
  return {
    viewsSelector: {
      type: 'Selector',
      key: 'viewsSelectorTestMock',
      atom: atom(() => [view]),
    },
  };
});

const WIDGET_ID = 'widget-1';
const OTHER_WIDGET_ID = 'widget-2';

const makeViewBackedWidget = (widgetId: string, index: number) => {
  const widget = makeWidget(widgetId, index);

  return {
    ...widget,
    configuration: { ...widget.configuration, viewId: view.id },
  } as PageLayoutWidget;
};

const makeViewBackedDraftLayout = (widgetIds: string[] = [WIDGET_ID]) => ({
  ...makeDraft([
    makeTab(
      'tab-1',
      widgetIds.map((widgetId, index) => makeViewBackedWidget(widgetId, index)),
    ),
  ]),
  id: PAGE_LAYOUT_TEST_INSTANCE_ID,
});

const getWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <PageLayoutTestWrapper
      store={store}
      layoutType={PageLayoutType.RECORD_PAGE}
      instanceId={PAGE_LAYOUT_TEST_INSTANCE_ID}
    >
      {children}
    </PageLayoutTestWrapper>
  );

describe('useInitializeRecordTableWidgetViewDrafts', () => {
  it('should seed the draft and persisted snapshots of view-backed widgets in edit mode', () => {
    const store = createStore();

    store.set(isLayoutCustomizationModeEnabledState.atom, true);
    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      makeViewBackedDraftLayout(),
    );

    renderHook(() => useInitializeRecordTableWidgetViewDrafts(), {
      wrapper: getWrapper(store),
    });

    const draftSnapshots = store.get(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
    );
    const persistedSnapshots = store.get(
      recordTableWidgetViewPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
    );

    expect(draftSnapshots[WIDGET_ID]).toBeDefined();
    expect(draftSnapshots[WIDGET_ID].view.id).toBe(view.id);
    expect(persistedSnapshots[WIDGET_ID]).toBe(draftSnapshots[WIDGET_ID]);
  });

  it('should not seed anything outside edit mode', () => {
    const store = createStore();

    store.set(isLayoutCustomizationModeEnabledState.atom, false);
    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      makeViewBackedDraftLayout(),
    );

    renderHook(() => useInitializeRecordTableWidgetViewDrafts(), {
      wrapper: getWrapper(store),
    });

    const draftSnapshots = store.get(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
    );

    expect(draftSnapshots[WIDGET_ID]).toBeUndefined();
  });

  it('should keep an existing snapshot over the freshly built one while seeding the missing ones', () => {
    const store = createStore();

    const existingSnapshot = buildRecordTableWidgetViewSnapshot(
      getMockObjectMetadataItemOrThrow('company'),
    );

    store.set(isLayoutCustomizationModeEnabledState.atom, true);
    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      makeViewBackedDraftLayout([WIDGET_ID, OTHER_WIDGET_ID]),
    );
    store.set(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      { [WIDGET_ID]: existingSnapshot },
    );

    renderHook(() => useInitializeRecordTableWidgetViewDrafts(), {
      wrapper: getWrapper(store),
    });

    const draftSnapshots = store.get(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
    );

    expect(draftSnapshots[OTHER_WIDGET_ID]).toBeDefined();
    expect(draftSnapshots[WIDGET_ID]).toBe(existingSnapshot);
  });
});
