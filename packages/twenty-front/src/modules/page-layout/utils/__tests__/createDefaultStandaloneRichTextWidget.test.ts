import {
  PageLayoutTabLayoutMode,
  WidgetType,
} from '~/generated-metadata/graphql';
import { createDefaultStandaloneRichTextWidget } from '@/page-layout/utils/createDefaultStandaloneRichTextWidget';

describe('createDefaultStandaloneRichTextWidget', () => {
  it('should create a standalone rich text widget with correct structure', () => {
    const widget = createDefaultStandaloneRichTextWidget(
      'widget-1',
      'tab-1',
      { blocknote: '[{"type":"paragraph","content":"Test"}]' },
      {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 0,
        column: 0,
        rowSpan: 4,
        columnSpan: 4,
      },
    );

    expect(widget).toMatchObject({
      __typename: 'PageLayoutWidget',
      id: 'widget-1',
      pageLayoutTabId: 'tab-1',
      type: WidgetType.STANDALONE_RICH_TEXT,
      title: 'Untitled Rich Text',
      configuration: {
        body: { blocknote: '[{"type":"paragraph","content":"Test"}]' },
      },
      position: {
        __typename: 'PageLayoutWidgetGridPosition',
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 0,
        column: 0,
        rowSpan: 4,
        columnSpan: 4,
      },
    });
  });

  it('should use provided objectMetadataId or default to null', () => {
    const withObjectId = createDefaultStandaloneRichTextWidget(
      'w1',
      't1',
      { blocknote: '[]' },
      {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 0,
        column: 0,
        rowSpan: 1,
        columnSpan: 1,
      },
      'object-1',
    );

    const withoutObjectId = createDefaultStandaloneRichTextWidget(
      'w2',
      't1',
      { blocknote: '[]' },
      {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 0,
        column: 0,
        rowSpan: 1,
        columnSpan: 1,
      },
    );

    expect(withObjectId.objectMetadataId).toBe('object-1');
    expect(withoutObjectId.objectMetadataId).toBeNull();
  });

  it('should create a Note with a vertical list position for record pages', () => {
    const widget = createDefaultStandaloneRichTextWidget(
      'note-widget',
      'record-tab',
      { blocknote: '', markdown: null },
      {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: 2,
      },
      null,
      'Note',
    );

    expect(widget).toMatchObject({
      title: 'Note',
      type: WidgetType.STANDALONE_RICH_TEXT,
      objectMetadataId: null,
      position: {
        __typename: 'PageLayoutWidgetVerticalListPosition',
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: 2,
      },
      configuration: {
        body: { blocknote: '', markdown: null },
      },
    });
  });
});
