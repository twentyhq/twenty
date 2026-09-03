import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('buildDraftPageLayoutWidget', () => {
  const gridPosition = {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 2,
    column: 3,
    rowSpan: 4,
    columnSpan: 6,
  };

  it('should fill the shared widget skeleton around the given type and configuration', () => {
    const widget = buildDraftPageLayoutWidget({
      id: 'widget-1',
      pageLayoutTabId: 'tab-1',
      title: 'My Component',
      type: WidgetType.FRONT_COMPONENT,
      configuration: {
        __typename: 'FrontComponentConfiguration',
        configurationType: WidgetConfigurationType.FRONT_COMPONENT,
        frontComponentId: 'front-comp-1',
      },
      position: gridPosition,
    });

    expect(widget).toMatchObject({
      __typename: 'PageLayoutWidget',
      id: 'widget-1',
      applicationId: '',
      universalIdentifier: 'widget-1',
      isSystemSideEffect: false,
      pageLayoutTabId: 'tab-1',
      title: 'My Component',
      isActive: true,
      type: WidgetType.FRONT_COMPONENT,
      configuration: {
        __typename: 'FrontComponentConfiguration',
        configurationType: WidgetConfigurationType.FRONT_COMPONENT,
        frontComponentId: 'front-comp-1',
      },
      objectMetadataId: null,
      deletedAt: null,
    });
    expect(widget.createdAt).toBeDefined();
    expect(widget.updatedAt).toBeDefined();
  });

  it('should stamp the grid position typename', () => {
    const widget = buildDraftPageLayoutWidget({
      id: 'widget-1',
      pageLayoutTabId: 'tab-1',
      title: 'My Record Table',
      type: WidgetType.RECORD_TABLE,
      configuration: {
        configurationType: WidgetConfigurationType.RECORD_TABLE,
      },
      position: gridPosition,
    });

    expect(widget.position).toEqual({
      __typename: 'PageLayoutWidgetGridPosition',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 2,
      column: 3,
      rowSpan: 4,
      columnSpan: 6,
    });
  });

  it('should stamp the vertical list position typename', () => {
    const widget = buildDraftPageLayoutWidget({
      id: 'note-widget',
      pageLayoutTabId: 'record-tab',
      title: 'Note',
      type: WidgetType.STANDALONE_RICH_TEXT,
      configuration: {
        configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
        body: { blocknote: '', markdown: null },
      },
      position: {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: 2,
      },
    });

    expect(widget.position).toEqual({
      __typename: 'PageLayoutWidgetVerticalListPosition',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 2,
    });
  });

  it('should keep a provided objectMetadataId', () => {
    const widget = buildDraftPageLayoutWidget({
      id: 'widget-1',
      pageLayoutTabId: 'tab-1',
      title: 'Dashboard guidance',
      type: WidgetType.STANDALONE_RICH_TEXT,
      configuration: {
        configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
        body: { blocknote: '[]' },
      },
      position: gridPosition,
      objectMetadataId: 'object-1',
    });

    expect(widget.objectMetadataId).toBe('object-1');
  });
});
