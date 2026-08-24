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
import { useOpenWidgetSettingsInSidePanel } from '@/side-panel/hooks/useOpenWidgetSettingsInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useIsDashboardPageLayout } from '@/side-panel/pages/page-layout/hooks/useIsDashboardPageLayout';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import {
  PageLayoutTabLayoutMode,
  WidgetType,
} from '~/generated-metadata/graphql';

jest.mock('@/side-panel/hooks/useSidePanelMenu');
jest.mock('@/side-panel/pages/page-layout/hooks/useIsDashboardPageLayout');
jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
);

describe('useOpenWidgetSettingsInSidePanel', () => {
  const mockCloseSidePanelMenu = jest.fn();
  const mockNavigatePageLayoutSidePanel = jest.fn();

  const getDraftAtom = () =>
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    });

  const getEditingWidgetIdAtom = () =>
    pageLayoutEditingWidgetIdComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    });

  beforeEach(() => {
    jest.clearAllMocks();

    (useSidePanelMenu as jest.Mock).mockReturnValue({
      closeSidePanelMenu: mockCloseSidePanelMenu,
    });
    (useIsDashboardPageLayout as jest.Mock).mockReturnValue(false);
    (useNavigatePageLayoutSidePanel as jest.Mock).mockReturnValue({
      navigatePageLayoutSidePanel: mockNavigatePageLayoutSidePanel,
    });
  });

  const renderOpenWidgetSettingsHook = (
    store: ReturnType<typeof createStore>,
  ) =>
    renderHook(
      () => useOpenWidgetSettingsInSidePanel(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper store={store}>
            {children}
          </PageLayoutTestWrapper>
        ),
      },
    );

  it('opens widget settings for a FILL_VIEWPORT widget in a vertical-list tab', () => {
    const store = createStore();
    const timelineWidget = {
      ...makeWidget('timeline-widget', 1),
      type: WidgetType.TIMELINE,
    };

    store.set(
      getDraftAtom(),
      makeDraft([
        makeTab('tab-1', [makeWidget('fields-widget', 0), timelineWidget]),
      ]),
    );

    const { result } = renderOpenWidgetSettingsHook(store);

    act(() => {
      result.current.openWidgetSettingsInSidePanel({
        widgetId: timelineWidget.id,
        widgetType: timelineWidget.type,
      });
    });

    expect(store.get(getEditingWidgetIdAtom())).toBe(timelineWidget.id);
    expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
      sidePanelPage: SidePanelPages.PageLayoutWidgetSettings,
      resetNavigationStack: true,
    });
    expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
  });

  it('opens widget settings for a FILL_VIEWPORT widget in a grid tab', () => {
    const store = createStore();
    const timelineWidget = {
      ...makeWidget('timeline-widget', 1),
      type: WidgetType.TIMELINE,
    };

    store.set(
      getDraftAtom(),
      makeDraft([
        makeTab(
          'tab-1',
          [makeWidget('fields-widget', 0), timelineWidget],
          0,
          PageLayoutTabLayoutMode.GRID,
        ),
      ]),
    );
    const { result } = renderOpenWidgetSettingsHook(store);

    act(() => {
      result.current.openWidgetSettingsInSidePanel({
        widgetId: timelineWidget.id,
        widgetType: timelineWidget.type,
      });
    });

    expect(store.get(getEditingWidgetIdAtom())).toBe(timelineWidget.id);
    expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
      sidePanelPage: SidePanelPages.PageLayoutWidgetSettings,
      resetNavigationStack: true,
    });
    expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
  });

  it('opens widget settings for a fit-content widget in a multi-widget tab', () => {
    const store = createStore();
    const frontComponentWidget = {
      ...makeWidget('front-component-widget', 1),
      type: WidgetType.FRONT_COMPONENT,
    };

    store.set(
      getDraftAtom(),
      makeDraft([
        makeTab('tab-1', [
          makeWidget('fields-widget', 0),
          frontComponentWidget,
        ]),
      ]),
    );

    const { result } = renderOpenWidgetSettingsHook(store);

    act(() => {
      result.current.openWidgetSettingsInSidePanel({
        widgetId: frontComponentWidget.id,
        widgetType: frontComponentWidget.type,
      });
    });

    expect(store.get(getEditingWidgetIdAtom())).toBe(frontComponentWidget.id);
    expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
      sidePanelPage: SidePanelPages.PageLayoutWidgetSettings,
      resetNavigationStack: true,
    });
    expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
  });

  it.each([WidgetType.IFRAME, WidgetType.GRAPH, WidgetType.RECORD_TABLE])(
    'opens generic widget settings for a %s widget on a record page',
    (widgetType) => {
      const store = createStore();
      const widget = {
        ...makeWidget('widget', 1),
        type: widgetType,
      };

      store.set(
        getDraftAtom(),
        makeDraft([makeTab('tab-1', [makeWidget('fields-widget', 0), widget])]),
      );

      const { result } = renderOpenWidgetSettingsHook(store);

      act(() => {
        result.current.openWidgetSettingsInSidePanel({
          widgetId: widget.id,
          widgetType: widget.type,
        });
      });

      expect(store.get(getEditingWidgetIdAtom())).toBe(widget.id);
      expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
        sidePanelPage: SidePanelPages.PageLayoutWidgetSettings,
        resetNavigationStack: true,
      });
    },
  );
});
