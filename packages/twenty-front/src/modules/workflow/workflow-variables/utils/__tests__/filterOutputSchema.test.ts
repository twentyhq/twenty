import { OutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { FieldMetadataType } from 'twenty-shared/types';
import { filterOutputSchema } from '../filterOutputSchema';

describe('filterOutputSchema', () => {
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
      objectMetadataId: '123',
    },
    fields,
  });

  const createBaseSchema = (fields = {}): OutputSchema => ({
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

  describe('shouldDisplayRecordObjects only (false, true)', () => {
    describe('record schema', () => {
      it('should keep record schema with object and filter compatible fields', () => {
        const inputSchema = createRecordSchema('person', {
          name: { isLeaf: true, value: 'string' },
          id: { isLeaf: true, type: FieldMetadataType.UUID },
          employee: {
            isLeaf: false,
            value: createRecordSchema('employee'),
          },
        });

        const expectedSchema = createRecordSchema('person', {
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
});
