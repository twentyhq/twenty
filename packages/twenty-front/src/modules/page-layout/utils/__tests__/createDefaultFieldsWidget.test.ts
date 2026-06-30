import { createDefaultFieldsWidget } from '@/page-layout/utils/createDefaultFieldsWidget';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('createDefaultFieldsWidget', () => {
  it('should return a FIELDS widget with correct properties', () => {
    const widget = createDefaultFieldsWidget({
      id: 'widget-1',
      pageLayoutTabId: 'tab-1',
      viewId: 'view-1',
      objectMetadataId: 'object-1',
      positionIndex: 3,
    });

    expect(widget).toMatchObject({
      __typename: 'PageLayoutWidget',
      id: 'widget-1',
      pageLayoutTabId: 'tab-1',
      title: 'Fields',
      isActive: true,
      type: WidgetType.FIELDS,
      configuration: {
        __typename: 'FieldsConfiguration',
        configurationType: WidgetConfigurationType.FIELDS,
        viewId: 'view-1',
      },
      gridPosition: {
        __typename: 'GridPosition',
        row: 0,
        column: 0,
        rowSpan: 1,
        columnSpan: 12,
      },
      position: {
        __typename: 'PageLayoutWidgetVerticalListPosition',
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: 3,
      },
      objectMetadataId: 'object-1',
      deletedAt: null,
    });
  });
});
