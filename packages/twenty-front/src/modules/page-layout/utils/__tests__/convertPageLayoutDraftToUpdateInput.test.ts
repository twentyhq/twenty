import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { convertPageLayoutDraftToUpdateInput } from '@/page-layout/utils/convertPageLayoutDraftToUpdateInput';
import { DYNAMIC_RELATION_WIDGET_ID_PREFIX } from '@/page-layout/utils/isDynamicRelationWidget';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';

const makeWidget = (
  overrides: Partial<PageLayoutWidget> & { id: string },
): PageLayoutWidget =>
  ({
    title: 'Widget',
    type: WidgetType.FIELDS,
    pageLayoutTabId: 'tab-1',
    gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
    configuration: null,
    objectMetadataId: null,
    ...overrides,
  }) as PageLayoutWidget;

const makeDraft = (tabs: DraftPageLayout['tabs']): DraftPageLayout =>
  ({
    id: 'layout-1',
    name: 'Layout',
    type: PageLayoutType.RECORD_PAGE,
    objectMetadataId: 'obj-1',
    tabs,
  }) as DraftPageLayout;

const makeTab = (
  id: string,
  widgets: PageLayoutWidget[],
): DraftPageLayout['tabs'][number] =>
  ({
    id,
    title: 'Tab',
    position: 0,
    pageLayoutId: 'layout-1',
    applicationId: 'app-1',
    widgets,
  }) as DraftPageLayout['tabs'][number];

describe('convertPageLayoutDraftToUpdateInput', () => {
  it('should convert a draft layout to update input', () => {
    const widget = makeWidget({ id: 'w1' });
    const draft = makeDraft([makeTab('tab-1', [widget])]);

    const result = convertPageLayoutDraftToUpdateInput(draft);

    expect(result.name).toBe('Layout');
    expect(result.type).toBe(PageLayoutType.RECORD_PAGE);
    expect(result.objectMetadataId).toBe('obj-1');
    expect(result.tabs).toHaveLength(1);
    expect(result.tabs[0].widgets).toHaveLength(1);
    expect(result.tabs[0].widgets[0].id).toBe('w1');
  });

  it('should filter out dynamic relation widgets', () => {
    const regularWidget = makeWidget({ id: 'w1' });
    const dynamicWidget = makeWidget({
      id: `${DYNAMIC_RELATION_WIDGET_ID_PREFIX}relation-1`,
      type: WidgetType.VIEW,
    });

    const draft = makeDraft([makeTab('tab-1', [regularWidget, dynamicWidget])]);

    const result = convertPageLayoutDraftToUpdateInput(draft);

    expect(result.tabs[0].widgets).toHaveLength(1);
    expect(result.tabs[0].widgets[0].id).toBe('w1');
  });

  it('should map gridPosition correctly', () => {
    const widget = makeWidget({
      id: 'w1',
      gridPosition: { row: 2, column: 3, rowSpan: 4, columnSpan: 5 },
    });
    const draft = makeDraft([makeTab('tab-1', [widget])]);

    const result = convertPageLayoutDraftToUpdateInput(draft);

    expect(result.tabs[0].widgets[0].gridPosition).toEqual({
      row: 2,
      column: 3,
      rowSpan: 4,
      columnSpan: 5,
    });
  });

  it('should handle objectMetadataId as null when not provided', () => {
    const draft = makeDraft([makeTab('tab-1', [])]);
    draft.objectMetadataId = undefined;

    const result = convertPageLayoutDraftToUpdateInput(draft);

    expect(result.objectMetadataId).toBeNull();
  });

  it('should handle multiple tabs', () => {
    const draft = makeDraft([
      makeTab('tab-1', [makeWidget({ id: 'w1' })]),
      makeTab('tab-2', [makeWidget({ id: 'w2' })]),
    ]);

    const result = convertPageLayoutDraftToUpdateInput(draft);

    expect(result.tabs).toHaveLength(2);
    expect(result.tabs[0].id).toBe('tab-1');
    expect(result.tabs[1].id).toBe('tab-2');
  });

  it('should keep all non-dynamic widgets when multiple widget types exist', () => {
    const fieldsWidget = makeWidget({ id: 'w1', type: WidgetType.FIELDS });
    const timelineWidget = makeWidget({
      id: 'w2',
      type: WidgetType.TIMELINE,
    });
    const dynamicWidget = makeWidget({
      id: `${DYNAMIC_RELATION_WIDGET_ID_PREFIX}rel`,
    });

    const draft = makeDraft([
      makeTab('tab-1', [fieldsWidget, dynamicWidget, timelineWidget]),
    ]);

    const result = convertPageLayoutDraftToUpdateInput(draft);

    expect(result.tabs[0].widgets).toHaveLength(2);
    expect(result.tabs[0].widgets.map((w) => w.id)).toEqual(['w1', 'w2']);
  });
});
