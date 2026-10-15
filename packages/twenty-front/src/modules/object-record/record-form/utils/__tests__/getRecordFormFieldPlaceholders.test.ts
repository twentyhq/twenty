import { getRecordFormFieldPlaceholders } from '@/object-record/record-form/utils/getRecordFormFieldPlaceholders';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('getRecordFormFieldPlaceholders', () => {
  it('should use the example value of simple fields as their placeholder', () => {
    expect(getRecordFormFieldPlaceholders(FieldMetadataType.NUMBER)).toEqual({
      placeholder: '2000',
    });
    expect(getRecordFormFieldPlaceholders(FieldMetadataType.UUID)).toEqual({
      placeholder: '00000000-0000-4000-8000-000000000000',
    });
    expect(getRecordFormFieldPlaceholders(FieldMetadataType.RAW_JSON)).toEqual({
      placeholder: '{"key":"value1"}',
    });
  });

  it.each([
    FieldMetadataType.TEXT,
    FieldMetadataType.SELECT,
    FieldMetadataType.DATE,
    FieldMetadataType.RELATION,
  ])('should keep the default placeholders of %s fields', (fieldType) => {
    expect(getRecordFormFieldPlaceholders(fieldType)).toEqual({});
  });
});
