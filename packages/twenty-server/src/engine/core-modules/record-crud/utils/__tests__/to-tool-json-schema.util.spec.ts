import { z } from 'zod';

import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';

describe('toToolJsonSchema', () => {
  it('should convert a zod schema to a JSON schema without the $schema key', () => {
    const jsonSchema = toToolJsonSchema(
      z.object({ name: z.string().describe('Record name') }),
    );

    expect(jsonSchema).toEqual({
      type: 'object',
      properties: { name: { type: 'string', description: 'Record name' } },
      required: ['name'],
    });
  });

  it('should reuse the conversion of a schema it already converted', () => {
    const schema = z.object({ id: z.uuid() });

    expect(toToolJsonSchema(schema)).toBe(toToolJsonSchema(schema));
  });
});
