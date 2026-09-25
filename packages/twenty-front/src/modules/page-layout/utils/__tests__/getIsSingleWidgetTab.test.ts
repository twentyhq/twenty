import {
  makeFlagGatedWidget,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getIsSingleWidgetTab } from '@/page-layout/utils/getIsSingleWidgetTab';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

const widget = (id: string, isActive: boolean): PageLayoutWidget => ({
  ...makeWidget(id, 0),
  isActive,
});

const tabWith = (
  layoutMode: PageLayoutTabLayoutMode,
  widgets: PageLayoutWidget[],
): Pick<PageLayoutTab, 'layoutMode' | 'widgets'> => ({ layoutMode, widgets });

describe('getIsSingleWidgetTab', () => {
  it('returns true for a list tab holding a single active widget', () => {
    expect(
      getIsSingleWidgetTab({
        featureFlags: {},
        tab: tabWith(PageLayoutTabLayoutMode.VERTICAL_LIST, [
          widget('widget-1', true),
        ]),
      }),
    ).toBe(true);
  });

  it('ignores inactive widgets', () => {
    expect(
      getIsSingleWidgetTab({
        featureFlags: {},
        tab: tabWith(PageLayoutTabLayoutMode.VERTICAL_LIST, [
          widget('widget-1', true),
          widget('widget-2', false),
        ]),
      }),
    ).toBe(true);
  });

  it('ignores widgets feature flags hide', () => {
    expect(
      getIsSingleWidgetTab({
        featureFlags: {},
        tab: tabWith(PageLayoutTabLayoutMode.VERTICAL_LIST, [
          makeFlagGatedWidget('flag-gated-widget', 0),
          widget('widget-1', true),
        ]),
      }),
    ).toBe(true);
  });

  it('returns false when several widgets are active', () => {
    expect(
      getIsSingleWidgetTab({
        featureFlags: {},
        tab: tabWith(PageLayoutTabLayoutMode.VERTICAL_LIST, [
          widget('widget-1', true),
          widget('widget-2', true),
        ]),
      }),
    ).toBe(false);
  });

  it('returns false for an empty tab', () => {
    expect(
      getIsSingleWidgetTab({
        featureFlags: {},
        tab: tabWith(PageLayoutTabLayoutMode.VERTICAL_LIST, []),
      }),
    ).toBe(false);
  });

  it('returns false for grid tabs', () => {
    expect(
      getIsSingleWidgetTab({
        featureFlags: {},
        tab: tabWith(PageLayoutTabLayoutMode.GRID, [widget('widget-1', true)]),
      }),
    ).toBe(false);
  });
});
