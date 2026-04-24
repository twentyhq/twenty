import { createDefaultFrontComponentWidget } from '@/page-layout/utils/createDefaultFrontComponentWidget';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('createDefaultFrontComponentWidget', () => {
  it('should return a FRONT_COMPONENT widget with grid position mapped to position', () => {
    const position = {
      row: 2,
      column: 3,
      rowSpan: 4,
      columnSpan: 6,
    };

    const widget = createDefaultFrontComponentWidget(
      'widget-1',
      'tab-1',
      'My Component',
      'front-comp-1',
      position,
    );

    expect(widget).toMatchObject({
      __typename: 'PageLayoutWidget',
      id: 'widget-1',
      pageLayoutTabId: 'tab-1',
      title: 'My Component',
      isActive: true,
      type: WidgetType.FRONT_COMPONENT,
      configuration: {
        __typename: 'FrontComponentConfiguration',
        configurationType: WidgetConfigurationType.FRONT_COMPONENT,
        frontComponentId: 'front-comp-1',
      },
      position: {
        __typename: 'PageLayoutWidgetGridPosition',
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 2,
        column: 3,
        rowSpan: 4,
        columnSpan: 6,
      },
      objectMetadataId: null,
      deletedAt: null,
    });
  });
});
