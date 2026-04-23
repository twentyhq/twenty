import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { getStepHeaderLabel } from '@/workflow/workflow-variables/utils/getStepHeaderLabel';
import { FieldMetadataType } from 'twenty-shared/types';

const mockStep = {
  id: 'step-1',
  name: 'Step 1',
  type: 'CREATE_RECORD',
  outputSchema: {
    company: {
      isLeaf: false,
      label: 'Company',
      value: {
        object: {
          label: 'Company',
          objectMetadataId: '123',
          isRelationField: false,
        },
        fields: {
          name: {
            label: 'Name',
            value: 'Twenty',
            isLeaf: true,
            fieldMetadataId: '123e4567-e89b-12d3-a456-426614174001',
            type: FieldMetadataType.TEXT,
            isCompositeSubField: false,
          },
          address: {
            isLeaf: false,
            label: 'Address',
            fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
            type: FieldMetadataType.ADDRESS,
            value: {
              street: {
                label: 'Street',
                value: '123 Main St',
                isLeaf: true,
                fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
                type: FieldMetadataType.TEXT,
                isCompositeSubField: true,
              },
              city: {
                label: 'City',
                value: 'New York',
                isLeaf: true,
                fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
                type: FieldMetadataType.TEXT,
                isCompositeSubField: true,
              },
              state: {
                label: 'State',
                value: 'NY',
                isLeaf: true,
                fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
                type: FieldMetadataType.TEXT,
                isCompositeSubField: true,
              },
              zip: {
                label: 'Zip',
                value: '10001',
                isLeaf: true,
                fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
                type: FieldMetadataType.TEXT,
                isCompositeSubField: true,
              },
            },
          },
        },
        _outputSchemaType: 'RECORD',
      },
    },
  },
} satisfies StepOutputSchemaV2;

describe('getStepHeaderLabel', () => {
  it('should return the step name when the path is empty', () => {
    const currentPath: string[] = [];
    expect(getStepHeaderLabel(mockStep, currentPath)).toBe('Step 1');
  });

  it('should return the field label when the path is not empty', () => {
    const currentPath: string[] = ['company'];
    expect(getStepHeaderLabel(mockStep, currentPath)).toBe('Company');
  });

  it('should return the nested field label when the path is not empty', () => {
    const currentPath: string[] = ['company', 'address'];
    expect(getStepHeaderLabel(mockStep, currentPath)).toBe('Address');
  });
});
