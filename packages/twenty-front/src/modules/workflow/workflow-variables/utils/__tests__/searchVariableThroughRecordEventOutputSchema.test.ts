import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { searchVariableThroughRecordEventOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughRecordEventOutputSchema';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('searchVariableThroughRecordEventOutputSchema', () => {
  const mockRecordSchema: RecordOutputSchemaV2 = {
    object: {
      objectMetadataId: 'company-metadata-id',
      label: 'Company',
    },
    fields: {
      // Event-based fields with properties.after prefix
      'properties.after.name': {
        isLeaf: true,
        type: FieldMetadataType.TEXT,
        label: 'Company Name',
        value: 'Acme Corp',
        fieldMetadataId: 'company-name-metadata-id',
        isCompositeSubField: false,
      },
      'properties.after.address': {
        isLeaf: false,
        label: 'Address',
        fieldMetadataId: 'address-metadata-id',
        type: FieldMetadataType.ADDRESS,
        value: {
          street: {
            isLeaf: true,
            type: FieldMetadataType.TEXT,
            label: 'Street',
            value: '123 Main St',
            fieldMetadataId: 'street-metadata-id',
            isCompositeSubField: true,
          },
          city: {
            isLeaf: true,
            type: FieldMetadataType.TEXT,
            label: 'City',
            value: 'New York',
            fieldMetadataId: 'city-metadata-id',
            isCompositeSubField: true,
          },
        },
      },
      'properties.after.owner': {
        isLeaf: false,
        label: 'Owner',
        fieldMetadataId: 'owner-metadata-id',
        type: FieldMetadataType.RELATION,
        value: {
          object: {
            objectMetadataId: 'person-metadata-id',
            label: 'Owner Person',
            isRelationField: true,
          },
          fields: {
            firstName: {
              isLeaf: true,
              type: FieldMetadataType.TEXT,
              label: 'Owner First Name',
              value: 'Jane',
              fieldMetadataId: 'owner-firstName-metadata-id',
              isCompositeSubField: false,
            },
            email: {
              isLeaf: true,
              type: FieldMetadataType.EMAILS,
              label: 'Owner Email',
              value: 'jane@example.com',
              fieldMetadataId: 'owner-email-metadata-id',
              isCompositeSubField: false,
            },
          },
          _outputSchemaType: 'RECORD',
        },
      },
      // Event-based fields with properties.before prefix
      'properties.before.name': {
        isLeaf: true,
        type: FieldMetadataType.TEXT,
        label: 'Company Name',
        value: 'Old Acme Corp',
        fieldMetadataId: 'company-name-metadata-id',
        isCompositeSubField: false,
      },
      'properties.before.address': {
        isLeaf: false,
        label: 'Address',
        fieldMetadataId: 'address-metadata-id',
        type: FieldMetadataType.ADDRESS,
        value: {
          street: {
            isLeaf: true,
            type: FieldMetadataType.TEXT,
            label: 'Street',
            value: '456 Old St',
            fieldMetadataId: 'street-metadata-id',
            isCompositeSubField: true,
          },
          city: {
            isLeaf: true,
            type: FieldMetadataType.TEXT,
            label: 'City',
            value: 'Old York',
            fieldMetadataId: 'city-metadata-id',
            isCompositeSubField: true,
          },
        },
      },
      'properties.before.owner': {
        isLeaf: false,
        label: 'Owner',
        fieldMetadataId: 'owner-metadata-id',
        type: FieldMetadataType.RELATION,
        value: {
          object: {
            objectMetadataId: 'person-metadata-id',
            label: 'Owner Person',
            isRelationField: true,
          },
          fields: {
            firstName: {
              isLeaf: true,
              type: FieldMetadataType.TEXT,
              label: 'Owner First Name',
              value: 'John',
              fieldMetadataId: 'owner-firstName-metadata-id',
              isCompositeSubField: false,
            },
            email: {
              isLeaf: true,
              type: FieldMetadataType.EMAILS,
              label: 'Owner Email',
              value: 'john@example.com',
              fieldMetadataId: 'owner-email-metadata-id',
              isCompositeSubField: false,
            },
          },
          _outputSchemaType: 'RECORD',
        },
      },
    },
    _outputSchemaType: 'RECORD',
  };

  describe('event variable parsing with properties.after prefix', () => {
    it('should find a basic field with properties.after prefix', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.after.name}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'Company Name',
        variablePathLabel: 'Record Updated > Company Name',
        variableType: FieldMetadataType.TEXT,
        fieldMetadataId: 'company-name-metadata-id',
        compositeFieldSubFieldName: undefined,
      });
    });

    it('should find a composite field with properties.after prefix', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.after.address.street}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'Street',
        variablePathLabel: 'Record Updated > Address > Street',
        variableType: FieldMetadataType.TEXT,
        fieldMetadataId: 'street-metadata-id',
        compositeFieldSubFieldName: 'street',
      });
    });

    it('should find a nested record field with properties.after prefix', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.after.owner.firstName}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'Owner First Name',
        variablePathLabel: 'Record Updated > Owner > Owner First Name',
        variableType: FieldMetadataType.TEXT,
        fieldMetadataId: 'owner-firstName-metadata-id',
        compositeFieldSubFieldName: undefined,
      });
    });
  });

  describe('event variable parsing with properties.before prefix', () => {
    it('should find a basic field with properties.before prefix', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.before.name}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'Company Name',
        variablePathLabel: 'Record Updated > Company Name',
        variableType: FieldMetadataType.TEXT,
        fieldMetadataId: 'company-name-metadata-id',
        compositeFieldSubFieldName: undefined,
      });
    });

    it('should find a composite field with properties.before prefix', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.before.address.city}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'City',
        variablePathLabel: 'Record Updated > Address > City',
        variableType: FieldMetadataType.TEXT,
        fieldMetadataId: 'city-metadata-id',
        compositeFieldSubFieldName: 'city',
      });
    });

    it('should find a nested record field with properties.before prefix', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.before.owner.email}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'Owner Email',
        variablePathLabel: 'Record Updated > Owner > Owner Email',
        variableType: FieldMetadataType.EMAILS,
        fieldMetadataId: 'owner-email-metadata-id',
        compositeFieldSubFieldName: undefined,
      });
    });
  });

  describe('variable name without brackets', () => {
    it('should handle variable names without double brackets', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: 'step1.properties.after.name',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'Company Name',
        variablePathLabel: 'Record Updated > Company Name',
        variableType: FieldMetadataType.TEXT,
        fieldMetadataId: 'company-name-metadata-id',
        compositeFieldSubFieldName: undefined,
      });
    });
  });

  describe('complex nested paths', () => {
    it('should handle deeply nested paths with event prefix', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Created',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.after.address.street}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'Street',
        variablePathLabel: 'Record Created > Address > Street',
        variableType: FieldMetadataType.TEXT,
        fieldMetadataId: 'street-metadata-id',
        compositeFieldSubFieldName: 'street',
      });
    });

    it('should handle multiple path segments with event prefix', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.after.owner.firstName}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: 'Owner First Name',
        variablePathLabel: 'Record Updated > Owner > Owner First Name',
        variableType: FieldMetadataType.TEXT,
        fieldMetadataId: 'owner-firstName-metadata-id',
        compositeFieldSubFieldName: undefined,
      });
    });
  });

  describe('full record mode', () => {
    it('should return record object label when isFullRecord is true with event prefix', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Created',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.after.id}}',
        isFullRecord: true,
      });

      expect(result).toEqual({
        variableLabel: 'Company',
        variablePathLabel: 'Record Created > Company',
        variableType: undefined,
        fieldMetadataId: undefined,
        compositeFieldSubFieldName: undefined,
      });
    });

    it('should return nested record object label when isFullRecord is true with event prefix', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.before.owner.id}}',
        isFullRecord: true,
      });

      expect(result).toEqual({
        variableLabel: 'Owner Person',
        variablePathLabel: 'Record Updated > Owner > Owner Person',
        variableType: undefined,
        fieldMetadataId: undefined,
        compositeFieldSubFieldName: undefined,
      });
    });
  });

  describe('error handling', () => {
    it('should handle undefined recordOutputSchema', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Test Step',
        recordOutputSchema: undefined as any,
        rawVariableName: '{{step1.properties.after.field}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
      });
    });

    it('should handle malformed variable name without stepId', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{properties.after.name}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
      });
    });

    it('should handle malformed variable name without field name', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
      });
    });

    it('should handle non-existent field with event prefix', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.after.nonExistentField}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
        variableType: undefined,
      });
    });

    it('should handle broken nested path with event prefix', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.after.address.nonExistent}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
        variableType: undefined,
      });
    });

    it('should handle broken nested record path with event prefix', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.after.owner.nonExistent}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
        variableType: undefined,
      });
    });

    it('should handle empty variable name', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
      });
    });

    it('should handle variable name with only brackets', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
      });
    });
  });

  describe('edge cases with variable parsing', () => {
    it('should handle variable with incomplete event prefix', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.name}}',
        isFullRecord: false,
      });

      // This should still work as the parser extracts what it can
      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
        variableType: undefined,
      });
    });

    it('should handle variable with extra dots', () => {
      const result = searchVariableThroughRecordEventOutputSchema({
        stepName: 'Record Updated',
        recordOutputSchema: mockRecordSchema,
        rawVariableName: '{{step1.properties.after.name.extra.segments}}',
        isFullRecord: false,
      });

      expect(result).toEqual({
        variableLabel: undefined,
        variablePathLabel: undefined,
        variableType: undefined,
      });
    });
  });
});
