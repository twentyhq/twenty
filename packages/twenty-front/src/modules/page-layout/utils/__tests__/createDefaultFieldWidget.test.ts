import { createDefaultFieldWidget } from '@/page-layout/utils/createDefaultFieldWidget';
import {
  FieldDisplayMode,
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('createDefaultFieldWidget', () => {
  it('should return a FIELD widget with CARD display mode by default', () => {
    const widget = createDefaultFieldWidget({
      id: 'widget-1',
      pageLayoutTabId: 'tab-1',
      title: 'Company Name',
      fieldMetadataId: 'field-1',
      objectMetadataId: 'object-1',
      positionIndex: 0,
    });

    expect(widget).toMatchObject({
      __typename: 'PageLayoutWidget',
      id: 'widget-1',
      pageLayoutTabId: 'tab-1',
      title: 'Company Name',
      isActive: true,
      type: WidgetType.FIELD,
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: 'field-1',
        fieldDisplayMode: FieldDisplayMode.CARD,
      },
      position: {
        __typename: 'PageLayoutWidgetVerticalListPosition',
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: 0,
      },
      objectMetadataId: 'object-1',
      deletedAt: null,
    });
  });

  it('should use the provided fieldDisplayMode', () => {
    const widget = createDefaultFieldWidget({
      id: 'widget-2',
      pageLayoutTabId: 'tab-1',
      title: 'Description',
      fieldMetadataId: 'field-2',
      fieldDisplayMode: FieldDisplayMode.EDITOR,
      objectMetadataId: 'object-1',
      positionIndex: 1,
    });

    expect(widget.configuration).toMatchObject({
      fieldDisplayMode: FieldDisplayMode.EDITOR,
    });
    expect(widget.position).toMatchObject({ index: 1 });
  });
});
