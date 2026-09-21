import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { bindFieldsWidgetToExistingView } from 'src/database/commands/upgrade-version-command/2-42/utils/bind-fields-widget-to-existing-view.util';

const FIELDS_WIDGET_UNIVERSAL_IDENTIFIER =
  '20202020-0000-0000-0000-0000000000f1';
const OTHER_WIDGET_UNIVERSAL_IDENTIFIER =
  '20202020-0000-0000-0000-0000000000f2';

const STANDARD_VIEW_ID = '20202020-0000-0000-0000-000000000010';
const EXISTING_VIEW_ID = '20202020-0000-0000-0000-000000000011';

const EXISTING_FIELDS_VIEW = { id: EXISTING_VIEW_ID };

const buildFieldsWidget = (
  overrides: Partial<FlatPageLayoutWidget> = {},
): FlatPageLayoutWidget =>
  ({
    universalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
    configuration: {
      configurationType: WidgetConfigurationType.FIELDS,
      viewId: STANDARD_VIEW_ID,
      newFieldDefaultVisibility: true,
    },
    universalConfiguration: {
      configurationType: WidgetConfigurationType.FIELDS,
      viewUniversalIdentifier: '20202020-0000-0000-0000-0000000000aa',
      newFieldDefaultVisibility: true,
    },
    ...overrides,
  }) as unknown as FlatPageLayoutWidget;

describe('bindFieldsWidgetToExistingView', () => {
  it('rebinds the fields widget to the view the workspace already holds', () => {
    const result = bindFieldsWidgetToExistingView({
      flatPageLayoutWidget: buildFieldsWidget(),
      fieldsWidgetUniversalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
      existingFieldsView: EXISTING_FIELDS_VIEW,
    });

    expect(result.configuration).toEqual({
      configurationType: WidgetConfigurationType.FIELDS,
      viewId: EXISTING_VIEW_ID,
      newFieldDefaultVisibility: true,
    });
  });

  it('keeps the universal configuration untouched, since it is id independent', () => {
    const widget = buildFieldsWidget();

    const result = bindFieldsWidgetToExistingView({
      flatPageLayoutWidget: widget,
      fieldsWidgetUniversalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
      existingFieldsView: EXISTING_FIELDS_VIEW,
    });

    expect(result.universalConfiguration).toEqual(
      widget.universalConfiguration,
    );
  });

  it('leaves the widget alone when the workspace has no fields view yet', () => {
    const widget = buildFieldsWidget();

    const result = bindFieldsWidgetToExistingView({
      flatPageLayoutWidget: widget,
      fieldsWidgetUniversalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
      existingFieldsView: undefined,
    });

    expect(result).toBe(widget);
  });

  it('leaves a widget that is not the fields widget alone', () => {
    const widget = buildFieldsWidget({
      universalIdentifier: OTHER_WIDGET_UNIVERSAL_IDENTIFIER,
    });

    const result = bindFieldsWidgetToExistingView({
      flatPageLayoutWidget: widget,
      fieldsWidgetUniversalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
      existingFieldsView: EXISTING_FIELDS_VIEW,
    });

    expect(result).toBe(widget);
  });

  it('leaves a widget whose configuration is not a fields configuration alone', () => {
    const widget = buildFieldsWidget({
      configuration: {
        configurationType: WidgetConfigurationType.TIMELINE,
      },
    } as unknown as Partial<FlatPageLayoutWidget>);

    const result = bindFieldsWidgetToExistingView({
      flatPageLayoutWidget: widget,
      fieldsWidgetUniversalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
      existingFieldsView: EXISTING_FIELDS_VIEW,
    });

    expect(result).toBe(widget);
  });

  it('does not mutate the widget it is given', () => {
    const widget = buildFieldsWidget();

    bindFieldsWidgetToExistingView({
      flatPageLayoutWidget: widget,
      fieldsWidgetUniversalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
      existingFieldsView: EXISTING_FIELDS_VIEW,
    });

    expect(widget.configuration).toMatchObject({ viewId: STANDARD_VIEW_ID });
  });
});
