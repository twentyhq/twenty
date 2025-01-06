import { OutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { filterOutputSchema } from '../filterOutputSchema';

describe('filterOutputSchema', () => {
  describe('edge cases', () => {
    it('should return the input schema when objectNameSingularToSelect is undefined', () => {
      const inputSchema: OutputSchema = {
        _outputSchemaType: 'RECORD',
        object: {
          nameSingular: 'person',
          fieldIdName: 'id',
          isLeaf: true,
          value: 'Fake value',
        },
        fields: {},
      };

      expect(filterOutputSchema(inputSchema, undefined)).toBe(inputSchema);
    });

    it('should return undefined when input schema is undefined', () => {
      expect(filterOutputSchema(undefined, 'person')).toBeUndefined();
    });
  });

  describe('record output schema', () => {
    const createRecordSchema = (
      nameSingular: string,
      fields = {},
    ): OutputSchema => ({
      _outputSchemaType: 'RECORD',
      object: {
        nameSingular,
        fieldIdName: 'id',
        isLeaf: true,
        value: 'Fake value',
      },
      fields,
    });

    it('should keep a matching record schema', () => {
      const inputSchema = createRecordSchema('person');

      expect(filterOutputSchema(inputSchema, 'person')).toEqual(inputSchema);
    });

    it('should filter out a non-matching record schema with no valid fields', () => {
      const inputSchema = createRecordSchema('company');

      expect(filterOutputSchema(inputSchema, 'person')).toBeUndefined();
    });

    it('should keep valid nested records while filtering out invalid ones', () => {
      const inputSchema = createRecordSchema('company', {
        employee: {
          isLeaf: false,
          value: createRecordSchema('person', {
            manager: {
              isLeaf: false,
              value: createRecordSchema('person'),
            },
          }),
        },
        department: {
          isLeaf: false,
          value: createRecordSchema('department'),
        },
      });

      const expectedSchema = {
        _outputSchemaType: 'RECORD',
        fields: {
          employee: {
            isLeaf: false,
            value: createRecordSchema('person', {
              manager: {
                isLeaf: false,
                value: createRecordSchema('person'),
              },
            }),
          },
        },
      };

      expect(filterOutputSchema(inputSchema, 'person')).toEqual(expectedSchema);
    });

    it('should ignore leaf fields', () => {
      const inputSchema = createRecordSchema('company', {
        name: { isLeaf: true, value: 'string' },
        employee: {
          isLeaf: false,
          value: createRecordSchema('person'),
        },
      });

      const expectedSchema = {
        _outputSchemaType: 'RECORD',
        fields: {
          employee: {
            isLeaf: false,
            value: createRecordSchema('person'),
          },
        },
      };

      expect(filterOutputSchema(inputSchema, 'person')).toEqual(expectedSchema);
    });
  });

  describe('base output schema', () => {
    const createBaseSchema = (fields = {}): OutputSchema => ({
      ...fields,
    });

    it('should filter out base schema with no valid records', () => {
      const inputSchema = createBaseSchema({
        field1: {
          isLeaf: true,
          value: 'string',
        },
      });

      expect(filterOutputSchema(inputSchema, 'person')).toBeUndefined();
    });

    it('should keep base schema with valid nested records', () => {
      const inputSchema = createBaseSchema({
        field1: {
          isLeaf: false,
          value: {
            _outputSchemaType: 'RECORD',
            object: { nameSingular: 'person' },
            fields: {},
          },
        },
      });

      expect(filterOutputSchema(inputSchema, 'person')).toEqual({
        field1: {
          isLeaf: false,
          value: {
            _outputSchemaType: 'RECORD',
            object: { nameSingular: 'person' },
            fields: {},
          },
        },
      });
    });

    it('should handle deeply nested valid records', () => {
      const inputSchema = createBaseSchema({
        level1: {
          isLeaf: false,
          value: createBaseSchema({
            level2: {
              isLeaf: false,
              value: {
                _outputSchemaType: 'RECORD',
                object: { nameSingular: 'person' },
                fields: {},
              },
            },
          }),
        },
      });

      expect(filterOutputSchema(inputSchema, 'person')).toEqual({
        level1: {
          isLeaf: false,
          value: {
            level2: {
              isLeaf: false,
              value: {
                _outputSchemaType: 'RECORD',
                object: { nameSingular: 'person' },
                fields: {},
              },
            },
          },
        },
      });
    });
  });
});
