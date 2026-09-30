import { FieldMetadataType } from 'twenty-shared/types';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { generateFindToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/find-tool.zod-schema';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

describe('generateFindToolInputSchema', () => {
  it('should include containsAny in the generated tool input schema for MULTI_SELECT fields', () => {
    const mockObjectMetadata: ObjectMetadataForToolSchema = {
      id: 'mock-object-id',
      nameSingular: 'mockObject',
      namePlural: 'mockObjects',
      fields: [
        {
          id: 'field-1',
          type: FieldMetadataType.MULTI_SELECT,
          name: 'tags',
          options: [
            { id: '1', value: 'A', position: 0, label: 'A', color: 'green' },
            { id: '2', value: 'B', position: 1, label: 'B', color: 'red' },
          ],
        } as unknown as FlatFieldMetadata,
      ],
    } as unknown as ObjectMetadataForToolSchema;

    const schema = generateFindToolInputSchema(mockObjectMetadata);

    expect(schema).not.toBeNull();
    
    // Test that the schema successfully parses `containsAny` for `tags`
    const parsed = schema.parse({
      select: ['tags'],
      tags: {
        containsAny: ['A'],
      },
    });

    expect(parsed.tags).toEqual({ containsAny: ['A'] });

    // Ensure `in` is not allowed on `tags` by Zod strip/strict behavior
    const stripped = schema.parse({
      select: ['tags'],
      tags: {
        in: ['A'],
      },
    });
    
    expect((stripped.tags as any).in).toBeUndefined();
  });
});
