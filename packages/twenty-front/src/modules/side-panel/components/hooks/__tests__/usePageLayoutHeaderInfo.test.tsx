import {
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { usePageLayoutHeaderInfo } from '@/side-panel/components/hooks/usePageLayoutHeaderInfo';
import { renderHook } from '@testing-library/react';
import { SidePanelPages } from 'twenty-shared/types';
import {
  IconLayoutDashboard,
  IconListDetails,
  IconPerspective,
} from 'twenty-ui/icon';
import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('usePageLayoutHeaderInfo', () => {
  const getWidgetSettingsHeaderInfo = (widgetType: WidgetType) => {
    const widget = {
      ...makeWidget('widget-id', 0),
      type: widgetType,
    };

    return renderHook(() =>
      usePageLayoutHeaderInfo({
        sidePanelPage: SidePanelPages.PageLayoutWidgetSettings,
        draftPageLayout: { tabs: [makeTab('tab-id', [widget])] },
        pageLayoutEditingWidgetId: widget.id,
        openTabId: null,
        editedTitle: null,
      }),
    ).result.current;
  };

  it('identifies a viewport-filling widget in the side-panel header', () => {
    expect(getWidgetSettingsHeaderInfo(WidgetType.EMAILS)?.headerType).toBe(
      'Full-height Widget',
    );
  });

  it('keeps the generic label for a fit-content widget', () => {
    expect(
      getWidgetSettingsHeaderInfo(WidgetType.FRONT_COMPONENT)?.headerType,
    ).toBe('Widget');
  });

  it('identifies an explicit TAB_VIEWPORT front component in the side-panel header', () => {
    const widget = {
      ...makeWidget('widget-id', 0),
      type: WidgetType.FRONT_COMPONENT,
      position: {
        __typename: 'PageLayoutWidgetVerticalListPosition' as const,
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: 0,
        heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
      },
    };

    const { result } = renderHook(() =>
      usePageLayoutHeaderInfo({
        sidePanelPage: SidePanelPages.PageLayoutWidgetSettings,
        draftPageLayout: { tabs: [makeTab('tab-id', [widget])] },
        pageLayoutEditingWidgetId: widget.id,
        openTabId: null,
        editedTitle: null,
      }),
    );

    expect(result.current?.headerType).toBe('Full-height Widget');
  });

  it('keeps the generic widget icon', () => {
    expect(
      getWidgetSettingsHeaderInfo(WidgetType.FRONT_COMPONENT)?.headerIcon,
    ).toBe(IconLayoutDashboard);
  });

  it.each([
    SidePanelPages.RecordPageFieldsSettings,
    SidePanelPages.RecordPageFieldSettings,
  ])('uses the canonical field icon for %s', (sidePanelPage) => {
    const widget = makeWidget('widget-id', 0);
    const { result } = renderHook(() =>
      usePageLayoutHeaderInfo({
        sidePanelPage,
        draftPageLayout: { tabs: [makeTab('tab-id', [widget])] },
        pageLayoutEditingWidgetId: widget.id,
        openTabId: null,
        editedTitle: 'Edited field widget',
      }),
    );

    expect(result.current).toMatchObject({
      headerIcon: IconListDetails,
      title: 'Edited field widget',
      widgetInEditMode: widget,
      isIconEditable: false,
    });
  });

  it('uses the canonical tab icon when the tab has no custom icon', () => {
    const tab = makeTab('tab-id', []);
    const { result } = renderHook(() =>
      usePageLayoutHeaderInfo({
        sidePanelPage: SidePanelPages.PageLayoutTabSettings,
        draftPageLayout: { tabs: [tab] },
        pageLayoutEditingWidgetId: null,
        openTabId: tab.id,
        editedTitle: null,
      }),
    );

    expect(result.current).toMatchObject({
      headerIcon: IconPerspective,
      headerType: 'Tab',
      title: tab.title,
      isIconEditable: true,
    });
  });
});
