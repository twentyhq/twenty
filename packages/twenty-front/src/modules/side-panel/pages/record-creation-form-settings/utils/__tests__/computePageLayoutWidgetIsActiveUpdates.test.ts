import { computePageLayoutWidgetIsActiveUpdates } from '@/side-panel/pages/record-creation-form-settings/utils/computePageLayoutWidgetIsActiveUpdates';

const buildRecordFormField = (
  fieldMetadataId: string,
  widgets: { id: string; isActive: boolean }[],
) => ({
  fieldMetadataItem: { id: fieldMetadataId },
  widgets,
  isVisible: widgets.some((widget) => widget.isActive),
});

describe('computePageLayoutWidgetIsActiveUpdates', () => {
  it('should skip the fields whose visibility was not toggled or was toggled back', () => {
    expect(
      computePageLayoutWidgetIsActiveUpdates({
        recordFormFields: [
          buildRecordFormField('field-name', [
            { id: 'name-widget', isActive: true },
          ]),
          buildRecordFormField('field-domain', [
            { id: 'domain-widget', isActive: true },
            { id: 'hidden-domain-widget', isActive: false },
          ]),
        ],
        isVisibleByFieldMetadataId: { 'field-domain': true },
      }),
    ).toEqual([]);
  });

  it('should write the new visibility to every widget of a toggled field whose state differs', () => {
    expect(
      computePageLayoutWidgetIsActiveUpdates({
        recordFormFields: [
          buildRecordFormField('field-name', [
            { id: 'name-widget', isActive: true },
            { id: 'hidden-name-widget', isActive: false },
          ]),
          buildRecordFormField('field-nickname', [
            { id: 'nickname-widget', isActive: false },
            { id: 'second-nickname-widget', isActive: false },
          ]),
        ],
        isVisibleByFieldMetadataId: {
          'field-name': false,
          'field-nickname': true,
        },
      }),
    ).toEqual([
      { widgetId: 'name-widget', isActive: false },
      { widgetId: 'nickname-widget', isActive: true },
      { widgetId: 'second-nickname-widget', isActive: true },
    ]);
  });
});
