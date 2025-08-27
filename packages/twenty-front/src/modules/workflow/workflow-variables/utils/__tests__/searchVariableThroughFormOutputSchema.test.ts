import { type FormOutputSchema } from '@/workflow/workflow-variables/types/FormOutputSchema';
import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { searchVariableThroughFormOutputSchema } from '@/workflow/workflow-variables/utils/searchVariableThroughFormOutputSchema';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('searchVariableThroughFormOutputSchema', () => {
  const mockRecordSchema: RecordOutputSchemaV2 = {
    object: {
      objectMetadataId: 'person-metadata-id',
      label: 'Person',
    },
    fields: {
      firstName: {
        isLeaf: true,
        type: FieldMetadataType.TEXT,
        label: 'First Name',
        value: 'John',
        fieldMetadataId: 'person-firstName-metadata-id',
        isCompositeSubField: false,
      },
      lastName: {
        isLeaf: true,
        type: FieldMetadataType.TEXT,
        label: 'Last Name',
        value: 'Doe',
        fieldMetadataId: 'person-lastName-metadata-id',
        isCompositeSubField: false,
      },
      email: {
        isLeaf: true,
        type: FieldMetadataType.EMAILS,
        label: 'Email',
        value: 'john.doe@example.com',
        fieldMetadataId: 'person-email-metadata-id',
        isCompositeSubField: false,
      },
    },
    _outputSchemaType: 'RECORD',
  };

  const mockFormSchema: FormOutputSchema = {
    // Simple text field
    companyName: {
      isLeaf: true,
      type: FieldMetadataType.TEXT,
      label: 'Company Name',
      value: 'Acme Corp',
    },
    // Number field
    revenue: {
      isLeaf: true,
      type: FieldMetadataType.NUMBER,
      label: 'Annual Revenue',
      value: 1000000,
    },
    // Email field
    contactEmail: {
      isLeaf: true,
      type: FieldMetadataType.EMAILS,
      label: 'Contact Email',
      value: 'contact@acme.com',
    },
    // Record field (nested record)
    contactPerson: {
      isLeaf: false,
      label: 'Contact Person',
      value: mockRecordSchema,
    },
  };

  it('should handle simple text field access correctly', () => {
    const result = searchVariableThroughFormOutputSchema({
      stepName: 'Company Form',
      formOutputSchema: mockFormSchema,
      rawVariableName: '{{step1.companyName}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'Company Name',
      variablePathLabel: 'Company Form > Company Name',
      variableType: FieldMetadataType.TEXT,
    });
  });

  it('should handle number field access correctly', () => {
    const result = searchVariableThroughFormOutputSchema({
      stepName: 'Company Form',
      formOutputSchema: mockFormSchema,
      rawVariableName: '{{step1.revenue}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'Annual Revenue',
      variablePathLabel: 'Company Form > Annual Revenue',
      variableType: FieldMetadataType.NUMBER,
    });
  });

  it('should handle email field access correctly', () => {
    const result = searchVariableThroughFormOutputSchema({
      stepName: 'Company Form',
      formOutputSchema: mockFormSchema,
      rawVariableName: '{{step1.contactEmail}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'Contact Email',
      variablePathLabel: 'Company Form > Contact Email',
      variableType: FieldMetadataType.EMAILS,
    });
  });

  it('should handle nested record field access correctly', () => {
    const result = searchVariableThroughFormOutputSchema({
      stepName: 'Company Form',
      formOutputSchema: mockFormSchema,
      rawVariableName: '{{step1.contactPerson.firstName}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'First Name',
      variablePathLabel: 'Company Form > Contact Person > First Name',
      variableType: FieldMetadataType.TEXT,
      fieldMetadataId: 'person-firstName-metadata-id',
      compositeFieldSubFieldName: undefined,
    });
  });

  it('should handle nested record email field access correctly', () => {
    const result = searchVariableThroughFormOutputSchema({
      stepName: 'Company Form',
      formOutputSchema: mockFormSchema,
      rawVariableName: '{{step1.contactPerson.email}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'Email',
      variablePathLabel: 'Company Form > Contact Person > Email',
      variableType: FieldMetadataType.EMAILS,
      fieldMetadataId: 'person-email-metadata-id',
      compositeFieldSubFieldName: undefined,
    });
  });

  it('should return undefined for invalid field name', () => {
    const result = searchVariableThroughFormOutputSchema({
      stepName: 'Company Form',
      formOutputSchema: mockFormSchema,
      rawVariableName: '{{step1.invalidField}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined for invalid nested field name', () => {
    const result = searchVariableThroughFormOutputSchema({
      stepName: 'Company Form',
      formOutputSchema: mockFormSchema,
      rawVariableName: '{{step1.contactPerson.invalidField}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined when trying to access record field without specifying property', () => {
    const result = searchVariableThroughFormOutputSchema({
      stepName: 'Company Form',
      formOutputSchema: mockFormSchema,
      rawVariableName: '{{step1.contactPerson}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined when formOutputSchema is undefined', () => {
    const result = searchVariableThroughFormOutputSchema({
      stepName: 'Company Form',
      formOutputSchema: undefined as any,
      rawVariableName: '{{step1.companyName}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should return undefined when stepId or fieldName is undefined', () => {
    const result = searchVariableThroughFormOutputSchema({
      stepName: 'Company Form',
      formOutputSchema: mockFormSchema,
      rawVariableName: '{{}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: undefined,
      variablePathLabel: undefined,
    });
  });

  it('should handle variables without curly braces', () => {
    const result = searchVariableThroughFormOutputSchema({
      stepName: 'Company Form',
      formOutputSchema: mockFormSchema,
      rawVariableName: 'step1.companyName',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'Company Name',
      variablePathLabel: 'Company Form > Company Name',
      variableType: FieldMetadataType.TEXT,
    });
  });

  it('should handle complex nested path correctly', () => {
    // Test with a deeper path in case we have complex nested records
    const result = searchVariableThroughFormOutputSchema({
      stepName: 'Company Form',
      formOutputSchema: mockFormSchema,
      rawVariableName: '{{step1.contactPerson.lastName}}',
      isFullRecord: false,
    });

    expect(result).toEqual({
      variableLabel: 'Last Name',
      variablePathLabel: 'Company Form > Contact Person > Last Name',
      variableType: FieldMetadataType.TEXT,
      fieldMetadataId: 'person-lastName-metadata-id',
      compositeFieldSubFieldName: undefined,
    });
  });
});
