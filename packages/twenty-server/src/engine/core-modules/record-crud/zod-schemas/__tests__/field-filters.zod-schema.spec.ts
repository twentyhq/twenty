import { FieldMetadataType } from 'twenty-shared/types';

import { generateFieldFilterZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/field-filters.zod-schema';
import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

const fieldOfType = (
  type: FieldMetadataType,
  name = 'body',
  settings?: Record<string, unknown>,
) => ({ type, name, settings }) as FieldMetadataEntity;

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

  describe('MULTI_SELECT', () => {
    it('advertises the containsAny operator accepted by the query layer', () => {
      const schema = generateFieldFilterZodSchema({
        type: FieldMetadataType.MULTI_SELECT,
        name: 'tags',
        options: [{ value: 'CUSTOMER' }, { value: 'PARTNER' }],
      } as FieldMetadataEntity);

      expect(schema).not.toBeNull();
      const jsonSchema = toToolJsonSchema(schema!);

      expect(jsonSchema).toMatchObject({
        properties: {
          containsAny: {
            description: 'Contains any of these values',
            items: { enum: ['CUSTOMER', 'PARTNER'] },
            type: 'array',
          },
        },
      });
      expect(jsonSchema).not.toHaveProperty('properties.in');
    });
  });

  describe('MORPH_RELATION', () => {
    // Regression: morph relations (e.g. noteTarget.targetPerson) are filtered
    // by their join column (`${name}Id`). Without a dedicated case they hit the
    // text default and advertise like/ilike, which the runner rejects when it
    // resolves the relation (`Object person doesn't have any "ilike" field`).
    const uuid = '7def8b6a-ec89-48f1-9835-ec2f7c726ef0';

    it('filters by the related record id and rejects text operators', () => {
      const schema = generateFieldFilterZodSchema(
        fieldOfType(FieldMetadataType.MORPH_RELATION, 'targetPerson', {
          relationType: RelationType.MANY_TO_ONE,
        }),
      );

      expect(schema).not.toBeNull();
      expect(schema!.parse({ eq: uuid })).toEqual({ eq: uuid });
      // `ilike` is not a valid operator for a relation id — stripped.
      expect(schema!.parse({ ilike: '%Tom%' })).toEqual({});
    });
  });
});
