import { isOnDemandField } from '@/object-record/record-field/on-demand/utils/isOnDemandField';
import { FieldMetadataType } from 'twenty-shared/types';

const jsonField = {
  type: FieldMetadataType.RAW_JSON,
  settings: { isValueLoadedOnOpen: true },
};

describe('isOnDemandField', () => {
  it('loads configured JSON when opened', () => {
    expect(isOnDemandField(jsonField)).toBe(true);
  });

  it.each([undefined, null, {}, { isValueLoadedOnOpen: false }])(
    'keeps JSON eager when the setting is absent or disabled (%j)',
    (settings) => {
      expect(isOnDemandField({ ...jsonField, settings })).toBe(false);
    },
  );

  it('does not defer unsupported field types', () => {
    expect(
      isOnDemandField({ ...jsonField, type: FieldMetadataType.TEXT }),
    ).toBe(false);
  });
});
