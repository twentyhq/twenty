import { type FlatPageLayoutWidget } from '@/metadata-store/types/FlatPageLayoutWidget';
import { addTypenamesToFlatPageLayoutWidget } from '@/metadata-store/utils/addTypenamesToFlatPageLayoutWidget';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import {
  FieldDisplayMode,
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const buildMetadataEventWidget = (
  widgetProperties: Partial<FlatPageLayoutWidget>,
): FlatPageLayoutWidget =>
  ({
    id: 'widget-id',
    applicationId: 'application-id',
    universalIdentifier: 'widget-universal-identifier',
    isSystemSideEffect: false,
    pageLayoutTabId: 'tab-id',
    title: 'Widget',
    type: WidgetType.FRONT_COMPONENT,
    isActive: true,
    objectMetadataId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    configuration: {
      configurationType: WidgetConfigurationType.FRONT_COMPONENT,
      frontComponentId: 'front-component-id',
    },
    position: {
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 0,
    },
    ...widgetProperties,
  }) as FlatPageLayoutWidget;

describe('addTypenamesToFlatPageLayoutWidget', () => {
  it('should let a front component widget from a metadata event be read as one', () => {
    const widget = addTypenamesToFlatPageLayoutWidget(
      buildMetadataEventWidget({}),
    );

    expect(
      isWidgetConfigurationOfType(
        widget.configuration,
        'FrontComponentConfiguration',
      ),
    ).toBe(true);
    expect(widget.configuration).toEqual({
      __typename: 'FrontComponentConfiguration',
      configurationType: WidgetConfigurationType.FRONT_COMPONENT,
      frontComponentId: 'front-component-id',
    });
  });

  it('should let a field widget from a metadata event be read as one', () => {
    const widget = addTypenamesToFlatPageLayoutWidget(
      buildMetadataEventWidget({
        type: WidgetType.FIELD,
        configuration: {
          configurationType: WidgetConfigurationType.FIELD,
          fieldMetadataId: 'field-metadata-id',
          fieldDisplayMode: FieldDisplayMode.FIELD,
        } as FlatPageLayoutWidget['configuration'],
      }),
    );

    expect(isFieldWidget(widget)).toBe(true);
  });

  it.each([
    [PageLayoutTabLayoutMode.GRID, 'PageLayoutWidgetGridPosition'],
    [
      PageLayoutTabLayoutMode.VERTICAL_LIST,
      'PageLayoutWidgetVerticalListPosition',
    ],
    [PageLayoutTabLayoutMode.CANVAS, 'PageLayoutWidgetCanvasPosition'],
  ])('should type a %s position as %s', (layoutMode, expectedTypename) => {
    const widget = addTypenamesToFlatPageLayoutWidget(
      buildMetadataEventWidget({
        position: { layoutMode } as FlatPageLayoutWidget['position'],
      }),
    );

    expect(widget.position?.__typename).toBe(expectedTypename);
  });

  it('should keep a widget without position untouched apart from its configuration', () => {
    const widget = addTypenamesToFlatPageLayoutWidget(
      buildMetadataEventWidget({ position: null }),
    );

    expect(widget.position).toBeNull();
    expect(widget.configuration.__typename).toBe('FrontComponentConfiguration');
  });

  it('should return the same widget when it already comes from GraphQL', () => {
    const graphqlWidget = addTypenamesToFlatPageLayoutWidget(
      buildMetadataEventWidget({}),
    );

    expect(addTypenamesToFlatPageLayoutWidget(graphqlWidget)).toBe(
      graphqlWidget,
    );
  });
});
