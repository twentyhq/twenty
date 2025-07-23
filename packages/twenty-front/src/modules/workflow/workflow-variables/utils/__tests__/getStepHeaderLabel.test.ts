import { StepOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { getStepHeaderLabel } from '@/workflow/workflow-variables/utils/getStepHeaderLabel';

const mockStep = {
  id: 'step-1',
  name: 'Step 1',
  outputSchema: {
    company: {
      isLeaf: false,
      icon: 'company',
      label: 'Company',
      value: {
        object: {
          nameSingular: 'company',
          fieldIdName: 'id',
          label: 'Company',
          value: 'John',
          isLeaf: true,
          objectMetadataId: '123',
        },
        fields: {
          name: { label: 'Name', value: 'Twenty', isLeaf: true },
          address: {
            label: 'Address',
            value: {
              street: { label: 'Street', value: '123 Main St', isLeaf: true },
              city: { label: 'City', value: 'New York', isLeaf: true },
              state: { label: 'State', value: 'NY', isLeaf: true },
              zip: { label: 'Zip', value: '10001', isLeaf: true },
            },
            isLeaf: false,
          },
        },
        _outputSchemaType: 'RECORD',
      },
    },
  },
} satisfies StepOutputSchema;

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
