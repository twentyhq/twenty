import { cleanPageLayoutWidgetConfiguration } from 'src/database/commands/upgrade-version-command/2-58/utils/clean-page-layout-widget-configuration.util';

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

  it('drops null on a setting only another widget type allows to be null', () => {
    expect(
      cleanPageLayoutWidgetConfiguration({
        configurationType: 'FIELD',
        fieldMetadataId: 'field-id',
        fieldDisplayMode: 'FIELD',
        viewId: null,
      }),
    ).toEqual({
      value: {
        configurationType: 'FIELD',
        fieldMetadataId: 'field-id',
        fieldDisplayMode: 'FIELD',
      },
      hasChanged: true,
    });
  });

  it('drops __typename at every depth on any widget type', () => {
    expect(
      cleanPageLayoutWidgetConfiguration({
        __typename: 'IframeConfiguration',
        configurationType: 'IFRAME',
        url: 'https://example.com',
        nested: { __typename: 'Nested', items: [{ __typename: 'Item', id: 1 }] },
      }),
    ).toEqual({
      value: {
        configurationType: 'IFRAME',
        url: 'https://example.com',
        nested: { items: [{ id: 1 }] },
      },
      hasChanged: true,
    });
  });

  it('leaves a missing configuration alone', () => {
    expect(cleanPageLayoutWidgetConfiguration(null)).toEqual({
      value: null,
      hasChanged: false,
    });
  });
});
