import { FieldMetadataType } from 'twenty-shared/types';

import { generateRandomFieldValue } from 'src/engine/core-modules/open-api/utils/generate-random-field-value.util';

const buildField = (name: string, type: FieldMetadataType) => ({
  name,
  type,
  options: null,
});

describe('generateRandomFieldValue', () => {
  // The document is diffed against main's in CI, so two generations of the same
  // field have to agree or every operation reads as changed.
  it.each([
    FieldMetadataType.UUID,
    FieldMetadataType.TEXT,
    FieldMetadataType.EMAILS,
    FieldMetadataType.LINKS,
    FieldMetadataType.CURRENCY,
    FieldMetadataType.FULL_NAME,
    FieldMetadataType.ADDRESS,
    FieldMetadataType.ACTOR,
    FieldMetadataType.NUMBER,
    FieldMetadataType.NUMERIC,
    FieldMetadataType.DATE_TIME,
  ])('returns a stable value for %s', (type) => {
    const field = buildField('someField', type);

    expect(generateRandomFieldValue({ field })).toEqual(
      generateRandomFieldValue({ field }),
    );
  });

  it('does not depend on the order fields are generated in', () => {
    const first = buildField('firstField', FieldMetadataType.EMAILS);
    const second = buildField('secondField', FieldMetadataType.EMAILS);

    const inOrder = generateRandomFieldValue({ field: second });

    generateRandomFieldValue({ field: first });

    expect(generateRandomFieldValue({ field: second })).toEqual(inOrder);
  });

  it('gives different fields different values', () => {
    expect(
      generateRandomFieldValue({
        field: buildField('alpha', FieldMetadataType.FULL_NAME),
      }),
    ).not.toEqual(
      generateRandomFieldValue({
        field: buildField('beta', FieldMetadataType.FULL_NAME),
      }),
    );
  });
});
