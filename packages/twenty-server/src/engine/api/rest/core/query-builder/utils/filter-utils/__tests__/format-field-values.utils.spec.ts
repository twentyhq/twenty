import { FieldMetadataType } from 'twenty-shared';

import { formatFieldValue } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/format-field-values.utils';

describe('formatFieldValue', () => {
  it('should format fieldNumber value', () => {
    expect(formatFieldValue('1', FieldMetadataType.NUMBER)).toEqual(1);

    expect(formatFieldValue('a', FieldMetadataType.NUMBER)).toEqual(NaN);

    expect(formatFieldValue('true', FieldMetadataType.BOOLEAN)).toEqual(true);

    expect(formatFieldValue('True', FieldMetadataType.BOOLEAN)).toEqual(true);

    expect(formatFieldValue('false', FieldMetadataType.BOOLEAN)).toEqual(false);

    expect(formatFieldValue('value', FieldMetadataType.TEXT)).toEqual('value');

    expect(formatFieldValue('"value"', FieldMetadataType.TEXT)).toEqual(
      'value',
    );

    expect(formatFieldValue("'value'", FieldMetadataType.TEXT)).toEqual(
      'value',
    );

    expect(formatFieldValue('value', FieldMetadataType.DATE_TIME)).toEqual(
      'value',
    );

    expect(formatFieldValue('"value"', FieldMetadataType.DATE_TIME)).toEqual(
      'value',
    );

    expect(formatFieldValue("'value'", FieldMetadataType.DATE_TIME)).toEqual(
      'value',
    );

    expect(
      formatFieldValue(
        '["2023-12-01T14:23:23.914Z","2024-12-01T14:23:23.914Z"]',
        undefined,
        'in',
      ),
    ).toEqual(['2023-12-01T14:23:23.914Z', '2024-12-01T14:23:23.914Z']);

    expect(formatFieldValue('[1,2]', FieldMetadataType.NUMBER, 'in')).toEqual([
      1, 2,
    ]);

    expect(() =>
      formatFieldValue('2024-12-01T14:23:23.914Z', undefined, 'in'),
    ).toThrow(
      "'filter' invalid for 'in' operator. Received '2024-12-01T14:23:23.914Z' but array value expected eg: 'field[in]:[value_1,value_2]'",
    );

    expect(
      formatFieldValue(
        '["2023-12-01T14:23:23.914Z","2024-12-01T14:23:23.914Z"]',
        undefined,
        'containsAny',
      ),
    ).toEqual(['2023-12-01T14:23:23.914Z', '2024-12-01T14:23:23.914Z']);

    expect(
      formatFieldValue('[1,2]', FieldMetadataType.NUMBER, 'containsAny'),
    ).toEqual([1, 2]);

    expect(() =>
      formatFieldValue('2024-12-01T14:23:23.914Z', undefined, 'containsAny'),
    ).toThrow(
      "'filter' invalid for 'containsAny' operator. Received '2024-12-01T14:23:23.914Z' but array value expected eg: 'field[containsAny]:[value_1,value_2]'",
    );
  });
});
