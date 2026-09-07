import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { WIDGET_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/WidgetSettingsSelectableItemIds';
import { useWidgetSettingsPlacementSelectableItemIds } from '@/side-panel/pages/page-layout/hooks/useWidgetSettingsPlacementSelectableItemIds';
import { renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import {
  PageLayoutTabLayoutMode,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('useWidgetSettingsPlacementSelectableItemIds', () => {
  const getDraftAtom = () =>
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    });

  const getEditingWidgetIdAtom = () =>
    pageLayoutEditingWidgetIdComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    });

  const renderPlacementSelectableItemIdsHook = ({
    editingWidgetId,
    layoutMode = PageLayoutTabLayoutMode.VERTICAL_LIST,
    widgetType,
  }: {
    editingWidgetId: string;
    layoutMode?: PageLayoutTabLayoutMode;
    widgetType: WidgetType;
  }) => {
    const store = createStore();
    const widget = {
      ...makeWidget(editingWidgetId, 0),
      type: widgetType,
    };

    store.set(
      getDraftAtom(),
      makeDraft([makeTab('tab-1', [widget], 0, layoutMode)]),
    );
    store.set(getEditingWidgetIdAtom(), editingWidgetId);

    return renderHook(
      () =>
        useWidgetSettingsPlacementSelectableItemIds(
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper store={store}>
            {children}
          </PageLayoutTestWrapper>
        ),
      },
    );
  };

  it('should omit add below while retaining add above for a viewport-filling widget', () => {
    const { result } = renderPlacementSelectableItemIdsHook({
      editingWidgetId: 'timeline-widget',
      widgetType: WidgetType.TIMELINE,
    });

    expect(result.current.placementSelectableItemIds).toContain(
      WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_ABOVE,
    );
    expect(result.current.placementSelectableItemIds).not.toContain(
      WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_BELOW,
    );
  });

  it('should include add above and add below for a fit-content widget', () => {
    const { result } = renderPlacementSelectableItemIdsHook({
      editingWidgetId: 'fields-widget',
      widgetType: WidgetType.FIELDS,
    });

    expect(result.current.placementSelectableItemIds).toEqual([
      WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_TO_TAB,
      WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_ABOVE,
      WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.ADD_WIDGET_BELOW,
    ]);
  });

  it('should omit placement item IDs when the placement section is not rendered', () => {
    const { result } = renderPlacementSelectableItemIdsHook({
      editingWidgetId: 'fields-widget',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgetType: WidgetType.FIELDS,
    });

    expect(result.current.placementSelectableItemIds).toEqual([]);
  });
});
