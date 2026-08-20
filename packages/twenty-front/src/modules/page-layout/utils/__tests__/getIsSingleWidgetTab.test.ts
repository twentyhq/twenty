import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getIsSingleWidgetTab } from '@/page-layout/utils/getIsSingleWidgetTab';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

const widget = (isActive: boolean) => ({ isActive }) as PageLayoutWidget;

const tabWith = (
  layoutMode: PageLayoutTabLayoutMode,
  widgets: PageLayoutWidget[],
): Pick<PageLayoutTab, 'layoutMode' | 'widgets'> => ({ layoutMode, widgets });

describe('getIsSingleWidgetTab', () => {
  it('returns true for a list tab holding a single active widget', () => {
    expect(
      getIsSingleWidgetTab({
        tab: tabWith(PageLayoutTabLayoutMode.VERTICAL_LIST, [widget(true)]),
      }),
    ).toBe(true);
  });

  it('ignores inactive widgets', () => {
    expect(
      getIsSingleWidgetTab({
        tab: tabWith(PageLayoutTabLayoutMode.VERTICAL_LIST, [
          widget(true),
          widget(false),
        ]),
      }),
    ).toBe(true);
  });

  it('returns false when several widgets are active', () => {
    expect(
      getIsSingleWidgetTab({
        tab: tabWith(PageLayoutTabLayoutMode.VERTICAL_LIST, [
          widget(true),
          widget(true),
        ]),
      }),
    ).toBe(false);
  });

  it('returns false for an empty tab', () => {
    expect(
      getIsSingleWidgetTab({
        tab: tabWith(PageLayoutTabLayoutMode.VERTICAL_LIST, []),
      }),
    ).toBe(false);
  });

  it('returns false for grid tabs', () => {
    expect(
      getIsSingleWidgetTab({
        tab: tabWith(PageLayoutTabLayoutMode.GRID, [widget(true)]),
      }),
    ).toBe(false);
  });
});
