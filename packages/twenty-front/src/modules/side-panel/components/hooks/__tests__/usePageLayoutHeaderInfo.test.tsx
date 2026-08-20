import {
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { usePageLayoutHeaderInfo } from '@/side-panel/components/hooks/usePageLayoutHeaderInfo';
import { renderHook } from '@testing-library/react';
import { SidePanelPages } from 'twenty-shared/types';
import { WidgetType } from '~/generated-metadata/graphql';

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
});
