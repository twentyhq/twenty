import { FieldMetadataType } from 'twenty-shared/types';

import {
  POSTGRES_DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE,
  POSTGRES_DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE,
} from 'src/engine/api/common/common-args-processors/data-arg-processor/constants/null-equivalent-values.constant';
import { findPostgresDefaultNullEquivalentValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/find-postgres-default-null-equivalent-value.util';

describe('findPostgresDefaultNullEquivalentValue', () => {
  describe('Simple Types', () => {
    describe('TEXT', () => {
      it('should return POSTGRES_DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE for null', () => {
        expect(
          findPostgresDefaultNullEquivalentValue(null, FieldMetadataType.TEXT),
        ).toBe(POSTGRES_DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
      });

      it('should return POSTGRES_DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE for empty string', () => {
        expect(
          findPostgresDefaultNullEquivalentValue('', FieldMetadataType.TEXT),
        ).toBe(POSTGRES_DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
      });

      it("should return POSTGRES_DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE for 'NULL'", () => {
        expect(
          findPostgresDefaultNullEquivalentValue(
            'NULL',
            FieldMetadataType.TEXT,
          ),
        ).toBe(POSTGRES_DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
      });

      it('should return undefined for non-null equivalent value', () => {
        expect(
          findPostgresDefaultNullEquivalentValue(
            'value',
            FieldMetadataType.TEXT,
          ),
        ).toBeUndefined();
      });
    });

    describe('ARRAY', () => {
      it('should return POSTGRES_DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE for null', () => {
        expect(
          findPostgresDefaultNullEquivalentValue(null, FieldMetadataType.ARRAY),
        ).toBe(POSTGRES_DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE);
      });

      it('should return POSTGRES_DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE for empty array', () => {
        expect(
          findPostgresDefaultNullEquivalentValue([], FieldMetadataType.ARRAY),
        ).toBe(POSTGRES_DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE);
      });

      it("should return POSTGRES_DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE for 'NULL'", () => {
        expect(
          findPostgresDefaultNullEquivalentValue(
            'NULL',
            FieldMetadataType.ARRAY,
          ),
        ).toBe(POSTGRES_DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE);
      });
    });
  });

  describe('ACTOR', () => {
    it('should return text default for name', () => {
      expect(
        findPostgresDefaultNullEquivalentValue(
          '',
          FieldMetadataType.ACTOR,
          'name',
        ),
      ).toBe(POSTGRES_DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });

    it('should return json default for context', () => {
      expect(
        findPostgresDefaultNullEquivalentValue(
          {},
          FieldMetadataType.ACTOR,
          'context',
        ),
      ).toBe(undefined);
    });
  });

  describe('ADDRESS', () => {
    it.each([
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressPostcode',
      'addressCountry',
    ])('should return text default for %s', (key) => {
      expect(
        findPostgresDefaultNullEquivalentValue(
          '',
          FieldMetadataType.ADDRESS,
          key,
        ),
      ).toBe(POSTGRES_DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('EMAILS', () => {
    it('should return text default for primaryEmail', () => {
      expect(
        findPostgresDefaultNullEquivalentValue(
          '',
          FieldMetadataType.EMAILS,
          'primaryEmail',
        ),
      ).toBe(POSTGRES_DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });

    it('should return array default for additionalEmails', () => {
      expect(
        findPostgresDefaultNullEquivalentValue(
          [],
          FieldMetadataType.EMAILS,
          'additionalEmails',
        ),
      ).toBe(POSTGRES_DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('LINKS', () => {
    it('should return text default for primaryLinkUrl', () => {
      expect(
        findPostgresDefaultNullEquivalentValue(
          '',
          FieldMetadataType.LINKS,
          'primaryLinkUrl',
        ),
      ).toBe(POSTGRES_DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });

    it('should return array default for secondaryLinks', () => {
      expect(
        findPostgresDefaultNullEquivalentValue(
          [],
          FieldMetadataType.LINKS,
          'secondaryLinks',
        ),
      ).toBe(POSTGRES_DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('PHONES', () => {
    it('should return text default for primaryPhoneNumber', () => {
      expect(
        findPostgresDefaultNullEquivalentValue(
          '',
          FieldMetadataType.PHONES,
          'primaryPhoneNumber',
        ),
      ).toBe(POSTGRES_DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });

    it('should return array default for additionalPhones', () => {
      expect(
        findPostgresDefaultNullEquivalentValue(
          [],
          FieldMetadataType.PHONES,
          'additionalPhones',
        ),
      ).toBe(POSTGRES_DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('RICH_TEXT_V2', () => {
    it('should return json default for blocknote', () => {
      expect(
        findPostgresDefaultNullEquivalentValue(
          {},
          FieldMetadataType.RICH_TEXT_V2,
          'blocknote',
        ),
      ).toBe(undefined);
    });

    it('should return text default for markdown', () => {
      expect(
        findPostgresDefaultNullEquivalentValue(
          '',
          FieldMetadataType.RICH_TEXT_V2,
          'markdown',
        ),
      ).toBe(POSTGRES_DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('FULL_NAME', () => {
    it.each(['firstName', 'lastName'])(
      'should return text default for %s',
      (key) => {
        expect(
          findPostgresDefaultNullEquivalentValue(
            '',
            FieldMetadataType.FULL_NAME,
            key,
          ),
        ).toBe(POSTGRES_DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
      },
    );
  });
});

it('should return undefined for unknown type', () => {
  expect(
    findPostgresDefaultNullEquivalentValue(null, 'UNKNOWN' as any),
  ).toBeUndefined();
});

it('should return undefined for unknown composite key', () => {
  expect(
    findPostgresDefaultNullEquivalentValue(
      '',
      FieldMetadataType.ACTOR,
      'unknown',
    ),
  ).toBeUndefined();
});
