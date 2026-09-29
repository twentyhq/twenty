import { computeDraftValueFromString } from '@/object-record/record-field/ui/utils/computeDraftValueFromString';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('computeDraftValueFromString', () => {
  it('should not pick a currency when starting a currency draft from typed text', () => {
    expect(
      computeDraftValueFromString({
        fieldDefinition: { type: FieldMetadataType.CURRENCY },
        value: '5',
      }),
    ).toEqual({ amount: '5', currencyCode: '' });
  });

  it('should return the typed text for a text field', () => {
    expect(
      computeDraftValueFromString({
        fieldDefinition: { type: FieldMetadataType.TEXT },
        value: 'hello',
      }),
    ).toBe('hello');
  });
});
