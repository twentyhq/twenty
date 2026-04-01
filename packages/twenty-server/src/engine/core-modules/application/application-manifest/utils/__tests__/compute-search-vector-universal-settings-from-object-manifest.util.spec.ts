import { type ObjectManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { computeSearchVectorUniversalSettingsFromObjectManifest } from 'src/engine/core-modules/application/application-manifest/utils/compute-search-vector-universal-settings-from-object-manifest.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

const buildObjectManifest = (
  overrides: Partial<ObjectManifest> & {
    fields: ObjectManifest['fields'];
    labelIdentifierFieldMetadataUniversalIdentifier: string;
  },
): ObjectManifest => ({
  universalIdentifier: 'obj-uuid-1',
  nameSingular: 'testObject',
  namePlural: 'testObjects',
  labelSingular: 'Test Object',
  labelPlural: 'Test Objects',
  ...overrides,
});

describe('computeSearchVectorUniversalSettingsFromObjectManifest', () => {
  it('should return asExpression and generatedType for a TEXT label identifier field', () => {
    const result = computeSearchVectorUniversalSettingsFromObjectManifest({
      objectManifest: buildObjectManifest({
        labelIdentifierFieldMetadataUniversalIdentifier: 'field-uuid-name',
        fields: [
          {
            universalIdentifier: 'field-uuid-name',
            name: 'name',
            label: 'Name',
            type: FieldMetadataType.TEXT,
          },
        ],
      }),
    });

    expect(result?.generatedType).toBe('STORED');
    expect(result?.asExpression).toContain("to_tsvector('simple'");
    expect(result?.asExpression).toContain('"name"');
  });

  it('should return asExpression for a FULL_NAME label identifier field', () => {
    const result = computeSearchVectorUniversalSettingsFromObjectManifest({
      objectManifest: buildObjectManifest({
        labelIdentifierFieldMetadataUniversalIdentifier: 'field-uuid-name',
        fields: [
          {
            universalIdentifier: 'field-uuid-name',
            name: 'name',
            label: 'Name',
            type: FieldMetadataType.FULL_NAME,
          },
        ],
      }),
    });

    expect(result?.generatedType).toBe('STORED');
    expect(result?.asExpression).toContain("to_tsvector('simple'");
    expect(result?.asExpression).toContain('"nameFirstName"');
    expect(result?.asExpression).toContain('"nameLastName"');
  });

  it('should return asExpression for an EMAILS label identifier field', () => {
    const result = computeSearchVectorUniversalSettingsFromObjectManifest({
      objectManifest: buildObjectManifest({
        labelIdentifierFieldMetadataUniversalIdentifier: 'field-uuid-email',
        fields: [
          {
            universalIdentifier: 'field-uuid-email',
            name: 'email',
            label: 'Email',
            type: FieldMetadataType.EMAILS,
          },
        ],
      }),
    });

    expect(result?.generatedType).toBe('STORED');
    expect(result?.asExpression).toContain("to_tsvector('simple'");
    expect(result?.asExpression).toContain('"emailPrimaryEmail"');
  });

  it('should throw when label identifier field is not found in fields', () => {
    expect(() =>
      computeSearchVectorUniversalSettingsFromObjectManifest({
        objectManifest: buildObjectManifest({
          labelIdentifierFieldMetadataUniversalIdentifier:
            'non-existent-field-uuid',
          fields: [
            {
              universalIdentifier: 'field-uuid-name',
              name: 'name',
              label: 'Name',
              type: FieldMetadataType.TEXT,
            },
          ],
        }),
      }),
    ).toThrow(ApplicationException);
  });

  it('should throw with INVALID_INPUT code when label identifier field is not found', () => {
    try {
      computeSearchVectorUniversalSettingsFromObjectManifest({
        objectManifest: buildObjectManifest({
          labelIdentifierFieldMetadataUniversalIdentifier:
            'non-existent-field-uuid',
          fields: [],
        }),
      });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationException);
      expect((error as ApplicationException).code).toBe(
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }
  });

  it('should throw when label identifier field has a non-searchable type', () => {
    expect(() =>
      computeSearchVectorUniversalSettingsFromObjectManifest({
        objectManifest: buildObjectManifest({
          labelIdentifierFieldMetadataUniversalIdentifier:
            'field-uuid-created-at',
          fields: [
            {
              universalIdentifier: 'field-uuid-created-at',
              name: 'createdAt',
              label: 'Created At',
              type: FieldMetadataType.DATE_TIME,
            },
          ],
        }),
      }),
    ).toThrow(ApplicationException);
  });

  it('should throw with INVALID_INPUT code when field type is not searchable', () => {
    try {
      computeSearchVectorUniversalSettingsFromObjectManifest({
        objectManifest: buildObjectManifest({
          labelIdentifierFieldMetadataUniversalIdentifier: 'field-uuid-number',
          fields: [
            {
              universalIdentifier: 'field-uuid-number',
              name: 'amount',
              label: 'Amount',
              type: FieldMetadataType.NUMBER,
            },
          ],
        }),
      });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationException);
      expect((error as ApplicationException).code).toBe(
        ApplicationExceptionCode.INVALID_INPUT,
      );
      expect((error as ApplicationException).message).toContain('amount');
      expect((error as ApplicationException).message).toContain(
        'not searchable',
      );
    }
  });
});
