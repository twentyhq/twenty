import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { resolveWidgetTypeSelectTargetTabId } from '@/side-panel/pages/page-layout/utils/resolveWidgetTypeSelectTargetTabId';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

const makeTab = (id: string, widgetIds: string[] = []): PageLayoutTab =>
  ({
    id,
    applicationId: '',
    title: id,
    isActive: true,
    position: 0,
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    pageLayoutId: '',
    widgets: widgetIds.map((wId) => ({ id: wId })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  }) as unknown as PageLayoutTab;

describe('resolveWidgetTypeSelectTargetTabId', () => {
  it('should return the tab containing the editing widget', () => {
    const tabs = [
      makeTab('tab-1', ['widget-a']),
      makeTab('tab-2', ['widget-b']),
    ];

    const result = resolveWidgetTypeSelectTargetTabId({
      pageLayoutEditingWidgetId: 'widget-b',
      tabs,
      widgetCreationTargetTabId: null,
    });

    expect(result).toBe('tab-2');
  });

  it('should throw when the editing widget is not found in any tab', () => {
    const tabs = [makeTab('tab-1', ['widget-a'])];

    expect(() =>
      resolveWidgetTypeSelectTargetTabId({
        pageLayoutEditingWidgetId: 'non-existent',
        tabs,
        widgetCreationTargetTabId: null,
      }),
    ).toThrow('Cannot find tab containing editing widget non-existent');
  });

  it('should return widgetCreationTargetTabId when no editing widget is set', () => {
    const tabs = [makeTab('tab-1', ['widget-a'])];

    const result = resolveWidgetTypeSelectTargetTabId({
      pageLayoutEditingWidgetId: null,
      tabs,
      widgetCreationTargetTabId: 'tab-1',
    });

    expect(result).toBe('tab-1');
  });

  it('should throw when both pageLayoutEditingWidgetId and widgetCreationTargetTabId are null', () => {
    const tabs = [makeTab('tab-1')];

    expect(() =>
      resolveWidgetTypeSelectTargetTabId({
        pageLayoutEditingWidgetId: null,
        tabs,
        widgetCreationTargetTabId: null,
      }),
    ).toThrow(
      'widgetCreationTargetTabId must be set when navigating to widget type select without an editing widget',
    );
  });
});
