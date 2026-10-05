import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldNumberMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeDraftValueFromFieldValue } from '@/object-record/record-field/ui/utils/computeDraftValueFromFieldValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const percentageFieldDefinition: Pick<
  FieldDefinition<FieldNumberMetadata>,
  'type' | 'metadata'
> = {
  type: FieldMetadataType.NUMBER,
  metadata: {
    fieldName: 'conversionRate',
    placeHolder: '',
    settings: { type: 'percentage' },
  },
};

const numberFieldDefinition: Pick<
  FieldDefinition<FieldNumberMetadata>,
  'type' | 'metadata'
> = {
  type: FieldMetadataType.NUMBER,
  metadata: {
    fieldName: 'employees',
    placeHolder: '',
    settings: { type: 'number' },
  },
};

describe('computeDraftValueFromFieldValue', () => {
  it('should convert a percentage value to a draft without float noise', () => {
    expect(
      computeDraftValueFromFieldValue({
        fieldDefinition: percentageFieldDefinition,
        fieldValue: 0.29,
      }),
    ).toBe('29');
    expect(
      computeDraftValueFromFieldValue({
        fieldDefinition: percentageFieldDefinition,
        fieldValue: 0.07,
      }),
    ).toBe('7');
    expect(
      computeDraftValueFromFieldValue({
        fieldDefinition: percentageFieldDefinition,
        fieldValue: 0.12345,
      }),
    ).toBe('12.345');
  });

  it('should return an empty draft for an empty percentage value', () => {
    expect(
      computeDraftValueFromFieldValue({
        fieldDefinition: percentageFieldDefinition,
        fieldValue: null,
      }),
    ).toBe('');
  });

  it('should keep a plain number value as is', () => {
    expect(
      computeDraftValueFromFieldValue({
        fieldDefinition: numberFieldDefinition,
        fieldValue: 0.29,
      }),
    ).toBe(0.29);
  });
});
