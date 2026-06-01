import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { generateFieldFilterZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/field-filters.zod-schema';

const fieldOfType = (type: FieldMetadataType, name = 'body') =>
  ({ type, name }) as FieldMetadataEntity;

describe('generateFieldFilterZodSchema', () => {
  describe('TEXT', () => {
    it('exposes scalar pattern operators at the field root', () => {
      const schema = generateFieldFilterZodSchema(
        fieldOfType(FieldMetadataType.TEXT),
      );

      expect(schema).not.toBeNull();
      expect(schema!.parse({ ilike: '%foo%' })).toEqual({ ilike: '%foo%' });
    });
  });

  describe('RICH_TEXT', () => {
    // Regression for the AI find-records bug: RICH_TEXT is a composite
    // (`markdown` / `blocknote` sub-fields). Advertising root-level scalar
    // operators made the agent emit `{ ilike }`, which the query layer rejects
    // with `Sub field "ilike" not found for composite type: RICH_TEXT`.
    it('routes pattern operators onto the markdown sub-field', () => {
      const schema = generateFieldFilterZodSchema(
        fieldOfType(FieldMetadataType.RICH_TEXT),
      );

      expect(schema).not.toBeNull();
      expect(schema!.parse({ markdown: { ilike: '%hello%' } })).toEqual({
        markdown: { ilike: '%hello%' },
      });
      expect(schema!.parse({ blocknote: { eq: 'x' } })).toEqual({
        blocknote: { eq: 'x' },
      });
    });

    it('no longer accepts scalar operators at the composite root', () => {
      const schema = generateFieldFilterZodSchema(
        fieldOfType(FieldMetadataType.RICH_TEXT),
      );

      // Root-level operators are stripped (unknown keys), so the malformed
      // `{ ilike }` filter never reaches the query runner.
      expect(schema!.parse({ ilike: '%hello%' })).toEqual({});
    });
  });
});
