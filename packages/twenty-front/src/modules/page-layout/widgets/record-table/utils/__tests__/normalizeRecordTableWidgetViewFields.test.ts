import { normalizeRecordTableWidgetViewFields } from '@/page-layout/widgets/record-table/utils/normalizeRecordTableWidgetViewFields';

describe('normalizeRecordTableWidgetViewFields', () => {
  it('should keep the label identifier view field visible and before every other view field', () => {
    const normalizedViewFields = normalizeRecordTableWidgetViewFields({
      labelIdentifierFieldMetadataId: 'label-field-id',
      viewFields: [
        {
          id: 'hidden-field-id',
          fieldMetadataId: 'hidden-field-metadata-id',
          isVisible: false,
          position: 0,
          size: 180,
        },
        {
          id: 'label-view-field-id',
          fieldMetadataId: 'label-field-id',
          isVisible: false,
          position: 4,
          size: 180,
        },
        {
          id: 'visible-field-id',
          fieldMetadataId: 'visible-field-metadata-id',
          isVisible: true,
          position: 0,
          size: 180,
        },
      ],
    });

    expect(normalizedViewFields).toEqual([
      {
        id: 'label-view-field-id',
        fieldMetadataId: 'label-field-id',
        isVisible: true,
        position: 0,
        size: 180,
      },
      {
        id: 'hidden-field-id',
        fieldMetadataId: 'hidden-field-metadata-id',
        isVisible: false,
        position: 1,
        size: 180,
      },
      {
        id: 'visible-field-id',
        fieldMetadataId: 'visible-field-metadata-id',
        isVisible: true,
        position: 2,
        size: 180,
      },
    ]);
  });

  it('should leave view fields unchanged when the label identifier view field is absent', () => {
    const viewFields = [
      {
        id: 'field-id',
        fieldMetadataId: 'field-metadata-id',
        isVisible: false,
        position: 0,
        size: 180,
      },
    ];

    expect(
      normalizeRecordTableWidgetViewFields({
        viewFields,
        labelIdentifierFieldMetadataId: 'missing-label-field-id',
      }),
    ).toBe(viewFields);
  });
});
