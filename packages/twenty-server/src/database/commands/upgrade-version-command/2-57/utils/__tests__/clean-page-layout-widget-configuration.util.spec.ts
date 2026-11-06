import { cleanPageLayoutWidgetConfiguration } from 'src/database/commands/upgrade-version-command/2-57/utils/clean-page-layout-widget-configuration.util';

describe('cleanPageLayoutWidgetConfiguration', () => {
  it('drops settings left from another chart type and cleared settings stored as null', () => {
    expect(
      cleanPageLayoutWidgetConfiguration({
        configurationType: 'AGGREGATE_CHART',
        aggregateFieldMetadataId: 'field-id',
        aggregateOperation: 'COUNT',
        prefix: '$',
        label: null,
        layout: 'VERTICAL',
        axisNameDisplay: 'NONE',
      }),
    ).toEqual({
      value: {
        configurationType: 'AGGREGATE_CHART',
        aggregateFieldMetadataId: 'field-id',
        aggregateOperation: 'COUNT',
        prefix: '$',
      },
      hasChanged: true,
    });
  });

  it('keeps null on settings whose type allows it and every key of other widget types', () => {
    const configuration = {
      configurationType: 'FIELDS',
      viewId: null,
      newFieldDefaultVisibility: null,
      anyOtherSetting: 'kept',
    };

    expect(cleanPageLayoutWidgetConfiguration(configuration)).toEqual({
      value: configuration,
      hasChanged: false,
    });
  });

  it('leaves a missing configuration alone', () => {
    expect(cleanPageLayoutWidgetConfiguration(null)).toEqual({
      value: null,
      hasChanged: false,
    });
  });
});
