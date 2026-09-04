import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { type FindRecordsOutputSchema } from '@/workflow/workflow-variables/types/FindRecordsOutputSchema';
import { FieldMetadataType } from 'twenty-shared/types';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';
import { filterOutputSchema } from '@/workflow/workflow-variables/utils/filterOutputSchema';

describe('filterOutputSchema', () => {
  const createRecordSchema = (
    nameSingular: string,
    fields = {},
  ): RecordOutputSchemaV2 => ({
    _outputSchemaType: 'RECORD',
    object: {
      label: nameSingular,
      objectMetadataId: '123',
      isRelationField: false,
    },
    fields,
  });

  const createBaseSchema = (fields = {}): BaseOutputSchemaV2 => ({
    ...fields,
  });

  describe('shouldDisplayRecordFields only (true, false)', () => {
    describe('record schema', () => {
      it('should return the input schema unchanged', () => {
        const inputSchema = createRecordSchema('person', {
          name: { isLeaf: true, value: 'string' },
          id: { isLeaf: true, type: FieldMetadataType.UUID },
        });

        expect(
          filterOutputSchema({
            shouldDisplayRecordFields: true,
            shouldDisplayRecordObjects: false,
            outputSchema: inputSchema,
          }),
        ).toBe(inputSchema);
      });

      it('should return undefined when input schema is undefined', () => {
        expect(
          filterOutputSchema({
            shouldDisplayRecordFields: true,
            shouldDisplayRecordObjects: false,
            outputSchema: undefined,
          }),
        ).toBeUndefined();
      });
    });

    describe('base schema', () => {
      it('should return the input schema unchanged', () => {
        const inputSchema = createBaseSchema({
          field1: { isLeaf: true, value: 'string' },
          field2: { isLeaf: true, type: FieldMetadataType.NUMBER },
        });

        expect(
          filterOutputSchema({
            shouldDisplayRecordFields: true,
            shouldDisplayRecordObjects: false,
            outputSchema: inputSchema,
          }),
        ).toBe(inputSchema);
      });
    });
  });

  describe('shouldDisplayRecordObjects and related fields only (false, true)', () => {
    describe('record schema', () => {
      it('should keep record schema with object and filter compatible fields', () => {
        const inputSchema = createRecordSchema('person', {
          name: { isLeaf: true, value: 'string' },
          id: { isLeaf: true, type: FieldMetadataType.UUID },
          employee: {
            isLeaf: false,
            value: createRecordSchema('employee'),
          },
          domain: { isLeaf: true, type: FieldMetadataType.TEXT },
        });

        const expectedSchema = createRecordSchema('person', {
          id: { isLeaf: true, type: FieldMetadataType.UUID },
          name: { isLeaf: true, value: 'string' },
          employee: {
            isLeaf: false,
            value: createRecordSchema('employee'),
          },
        });

        expect(
          filterOutputSchema({
            shouldDisplayRecordFields: false,
            shouldDisplayRecordObjects: true,
            outputSchema: inputSchema,
          }),
        ).toEqual(expectedSchema);
      });

      it('should return undefined for record schema without object and no valid fields', () => {
        const inputSchema = {
          _outputSchemaType: 'RECORD',
          fields: {
            invalidField: { isLeaf: true, type: FieldMetadataType.NUMBER },
          },
        } as any;

        expect(
          filterOutputSchema({
            shouldDisplayRecordFields: false,
            shouldDisplayRecordObjects: true,
            outputSchema: inputSchema,
          }),
        ).toBeUndefined();
      });
    });

    describe('base schema', () => {
      it('should keep base schema with valid nested records', () => {
        const inputSchema = createBaseSchema({
          field1: {
            isLeaf: false,
            value: createRecordSchema('person'),
          },
          field2: { isLeaf: true, type: FieldMetadataType.NUMBER },
        });

        const expectedSchema = {
          field1: {
            isLeaf: false,
            value: createRecordSchema('person'),
          },
        };

        expect(
          filterOutputSchema({
            shouldDisplayRecordFields: false,
            shouldDisplayRecordObjects: true,
            outputSchema: inputSchema,
          }),
        ).toEqual(expectedSchema);
      });

      it('should return undefined for base schema with no valid records', () => {
        const inputSchema = createBaseSchema({
          field1: { isLeaf: true, type: FieldMetadataType.NUMBER },
          field2: { isLeaf: true, type: FieldMetadataType.BOOLEAN },
        });

        expect(
          filterOutputSchema({
            shouldDisplayRecordFields: false,
            shouldDisplayRecordObjects: true,
            outputSchema: inputSchema,
          }),
        ).toBeUndefined();
      });
    });
  });

  describe('both shouldDisplayRecordFields and shouldDisplayRecordObjects (true, true)', () => {
    it('should return the input schema unchanged for record schema', () => {
      const inputSchema = createRecordSchema('person', {
        name: { isLeaf: true, value: 'string' },
        id: { isLeaf: true, type: FieldMetadataType.UUID },
      });

      expect(
        filterOutputSchema({
          shouldDisplayRecordFields: true,
          shouldDisplayRecordObjects: true,
          outputSchema: inputSchema,
        }),
      ).toBe(inputSchema);
    });

    it('should return the input schema unchanged for base schema', () => {
      const inputSchema = createBaseSchema({
        field1: { isLeaf: true, value: 'string' },
        field2: { isLeaf: true, type: FieldMetadataType.NUMBER },
      });

      expect(
        filterOutputSchema({
          shouldDisplayRecordFields: true,
          shouldDisplayRecordObjects: true,
          outputSchema: inputSchema,
        }),
      ).toBe(inputSchema);
    });

    it('should return undefined when input schema is undefined', () => {
      expect(
        filterOutputSchema({
          shouldDisplayRecordFields: true,
          shouldDisplayRecordObjects: true,
          outputSchema: undefined,
        }),
      ).toBeUndefined();
    });
  });

  describe('both shouldDisplayRecordFields and shouldDisplayRecordObjects false (false, false)', () => {
    it('should return the input schema unchanged', () => {
      const inputSchema = createRecordSchema('person', {
        name: { isLeaf: true, value: 'string' },
      });

      expect(
        filterOutputSchema({
          shouldDisplayRecordFields: false,
          shouldDisplayRecordObjects: false,
          outputSchema: inputSchema,
        }),
      ).toBe(inputSchema);
    });

    it('should return undefined when input schema is undefined', () => {
      expect(
        filterOutputSchema({
          shouldDisplayRecordFields: false,
          shouldDisplayRecordObjects: false,
          outputSchema: undefined,
        }),
      ).toBeUndefined();
    });
  });

  describe('fieldTypesToExclude', () => {
    it('should filter out the types', () => {
      const inputSchema = createRecordSchema('person', {
        name: { isLeaf: true, type: undefined, value: 'toto' },
        age: { isLeaf: true, type: FieldMetadataType.NUMBER },
        id: { isLeaf: true, type: FieldMetadataType.UUID },
      });

      const expectedSchema = createRecordSchema('person', {
        name: { isLeaf: true, type: undefined, value: 'toto' },
        age: { isLeaf: true, type: FieldMetadataType.NUMBER },
      });

      expect(
        filterOutputSchema({
          shouldDisplayRecordFields: true,
          shouldDisplayRecordObjects: false,
          outputSchema: inputSchema,
          fieldTypesToExclude: [FieldMetadataType.UUID],
        }),
      ).toEqual(expectedSchema);
    });

    it('should return the same schema if no types to filter', () => {
      const inputSchema = createRecordSchema('person', {
        name: { isLeaf: true, value: 'string' },
        id: { isLeaf: true, type: FieldMetadataType.UUID },
      });

      expect(
        filterOutputSchema({
          shouldDisplayRecordFields: true,
          shouldDisplayRecordObjects: false,
          outputSchema: inputSchema,
          fieldTypesToExclude: [],
        }),
      ).toEqual(inputSchema);
    });

    it('should filter out excluded types from nested schemas', () => {
      const inputSchema = createRecordSchema('person', {
        company: {
          isLeaf: false,
          type: FieldMetadataType.RELATION,
          value: createRecordSchema('company', {
            name: { isLeaf: true, type: FieldMetadataType.TEXT },
            score: { isLeaf: true, type: FieldMetadataType.RATING },
          }),
        },
      });

      expect(
        filterOutputSchema({
          shouldDisplayRecordFields: true,
          shouldDisplayRecordObjects: true,
          outputSchema: inputSchema,
          fieldTypesToExclude: [FieldMetadataType.RATING],
        }),
      ).toEqual(
        createRecordSchema('person', {
          company: {
            isLeaf: false,
            type: FieldMetadataType.RELATION,
            value: createRecordSchema('company', {
              name: { isLeaf: true, type: FieldMetadataType.TEXT },
            }),
          },
        }),
      );
    });

    it('should filter out excluded types from nested non-record fields', () => {
      const inputSchema = createRecordSchema('person', {
        details: {
          isLeaf: false,
          type: 'object',
          value: {
            metrics: {
              isLeaf: false,
              type: 'object',
              value: {
                label: { isLeaf: true, type: FieldMetadataType.TEXT },
                score: { isLeaf: true, type: FieldMetadataType.RATING },
              },
            },
          },
        },
      });

      expect(
        filterOutputSchema({
          shouldDisplayRecordFields: true,
          shouldDisplayRecordObjects: true,
          outputSchema: inputSchema,
          fieldTypesToExclude: [FieldMetadataType.RATING],
        }),
      ).toEqual(
        createRecordSchema('person', {
          details: {
            isLeaf: false,
            type: 'object',
            value: {
              metrics: {
                isLeaf: false,
                type: 'object',
                value: {
                  label: { isLeaf: true, type: FieldMetadataType.TEXT },
                },
              },
            },
          },
        }),
      );
    });

    it('should preserve step outputs while filtering their nested records', () => {
      const inputSchema: FindRecordsOutputSchema = {
        first: {
          isLeaf: false,
          label: 'First company',
          value: createRecordSchema('company', {
            name: { isLeaf: true, type: FieldMetadataType.TEXT },
            score: { isLeaf: true, type: FieldMetadataType.RATING },
          }),
        },
        all: undefined,
        totalCount: {
          isLeaf: true,
          type: 'number',
          label: 'Total count',
          value: 1,
        },
      };

      expect(
        filterOutputSchema({
          shouldDisplayRecordFields: true,
          shouldDisplayRecordObjects: true,
          outputSchema: inputSchema,
          fieldTypesToExclude: [FieldMetadataType.RATING],
        }),
      ).toEqual({
        ...inputSchema,
        first: {
          ...inputSchema.first,
          value: createRecordSchema('company', {
            name: { isLeaf: true, type: FieldMetadataType.TEXT },
          }),
        },
      });
    });
  });
});
