import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { generateFormOutputSchema } from '@/workflow/workflow-variables/utils/generate/generateFormOutputSchema';
import { FieldMetadataType } from 'twenty-shared/types';

const createMockObjectMetadataItem = (
  overrides: Partial<ObjectMetadataItem> = {},
): ObjectMetadataItem =>
  ({
    id: 'test-object-id',
    nameSingular: 'testObject',
    namePlural: 'testObjects',
    labelSingular: 'Test Object',
    labelPlural: 'Test Objects',
    icon: 'IconTest',
    fields: [],
    ...overrides,
  }) as ObjectMetadataItem;

describe('generateFormOutputSchema', () => {
  describe('Non-RECORD fields', () => {
    it('should generate leaf node for TEXT field', () => {
      const formFields: WorkflowFormActionField[] = [
        {
          id: 'field-1',
          name: 'firstName',
          label: 'First Name',
          type: FieldMetadataType.TEXT,
        },
      ];

      const result = generateFormOutputSchema(formFields, []);

      expect(result).toHaveProperty('firstName');
      expect(result.firstName).toMatchObject({
        isLeaf: true,
        type: 'TEXT',
        label: 'First Name',
      });
    });

    it('should use placeholder as value when defined', () => {
      const formFields: WorkflowFormActionField[] = [
        {
          id: 'field-1',
          name: 'email',
          label: 'Email',
          type: FieldMetadataType.TEXT,
          placeholder: 'Enter your email',
        },
      ];

      const result = generateFormOutputSchema(formFields, []);

      expect(result.email).toMatchObject({
        value: 'Enter your email',
      });
    });

    it('should generate fake value when placeholder is not defined', () => {
      const formFields: WorkflowFormActionField[] = [
        {
          id: 'field-1',
          name: 'name',
          label: 'Name',
          type: FieldMetadataType.TEXT,
        },
      ];

      const result = generateFormOutputSchema(formFields, []);

      expect(result.name.value).toBe('My text');
    });

    it('should handle NUMBER field type', () => {
      const formFields: WorkflowFormActionField[] = [
        {
          id: 'field-1',
          name: 'quantity',
          label: 'Quantity',
          type: FieldMetadataType.NUMBER,
        },
      ];

      const result = generateFormOutputSchema(formFields, []);

      expect(result.quantity).toMatchObject({
        isLeaf: true,
        type: FieldMetadataType.NUMBER,
        label: 'Quantity',
        value: 20,
      });
    });
  });

  describe('RECORD fields', () => {
    it('should generate non-leaf node for RECORD field with valid objectName', () => {
      const formFields: WorkflowFormActionField[] = [
        {
          id: 'field-1',
          name: 'selectedCompany',
          label: 'Selected Company',
          type: 'RECORD',
          settings: {
            objectName: 'company',
          },
        },
      ];
      const objectMetadataItems = [
        createMockObjectMetadataItem({
          nameSingular: 'company',
          labelSingular: 'Company',
        }),
      ];

      const result = generateFormOutputSchema(formFields, objectMetadataItems);

      expect(result).toHaveProperty('selectedCompany');
      expect(result.selectedCompany).toMatchObject({
        isLeaf: false,
        label: 'Selected Company',
      });
      expect((result.selectedCompany as any).value).toHaveProperty(
        '_outputSchemaType',
        'RECORD',
      );
    });

    it('should skip RECORD field when objectName is not defined', () => {
      const formFields: WorkflowFormActionField[] = [
        {
          id: 'field-1',
          name: 'selectedCompany',
          label: 'Selected Company',
          type: 'RECORD',
          settings: {},
        },
      ];

      const result = generateFormOutputSchema(formFields, []);

      expect(result).not.toHaveProperty('selectedCompany');
    });

    it('should skip RECORD field when settings is undefined', () => {
      const formFields: WorkflowFormActionField[] = [
        {
          id: 'field-1',
          name: 'selectedCompany',
          label: 'Selected Company',
          type: 'RECORD',
        },
      ];

      const result = generateFormOutputSchema(formFields, []);

      expect(result).not.toHaveProperty('selectedCompany');
    });

    it('should skip RECORD field when objectMetadataItem is not found', () => {
      const formFields: WorkflowFormActionField[] = [
        {
          id: 'field-1',
          name: 'selectedCompany',
          label: 'Selected Company',
          type: 'RECORD',
          settings: {
            objectName: 'unknownObject',
          },
        },
      ];
      const objectMetadataItems = [
        createMockObjectMetadataItem({
          nameSingular: 'company',
        }),
      ];

      const result = generateFormOutputSchema(formFields, objectMetadataItems);

      expect(result).not.toHaveProperty('selectedCompany');
    });
  });

  describe('Multiple fields', () => {
    it('should handle multiple fields of different types', () => {
      const formFields: WorkflowFormActionField[] = [
        {
          id: 'field-1',
          name: 'firstName',
          label: 'First Name',
          type: FieldMetadataType.TEXT,
        },
        {
          id: 'field-2',
          name: 'age',
          label: 'Age',
          type: FieldMetadataType.NUMBER,
        },
        {
          id: 'field-3',
          name: 'company',
          label: 'Company',
          type: 'RECORD',
          settings: {
            objectName: 'company',
          },
        },
      ];
      const objectMetadataItems = [
        createMockObjectMetadataItem({
          nameSingular: 'company',
          labelSingular: 'Company',
        }),
      ];

      const result = generateFormOutputSchema(formFields, objectMetadataItems);

      expect(Object.keys(result)).toHaveLength(3);
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('age');
      expect(result).toHaveProperty('company');
    });
  });

  describe('Empty input', () => {
    it('should return empty object for empty form fields', () => {
      const result = generateFormOutputSchema([], []);

      expect(result).toEqual({});
    });
  });
});
