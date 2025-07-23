import { StepOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { getCurrentSubStepFromPath } from '@/workflow/workflow-variables/utils/getCurrentSubStepFromPath';

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
        },
        _outputSchemaType: 'RECORD',
      },
    },
  },
} satisfies StepOutputSchema;

describe('getCurrentSubStepFromPath', () => {
  it('should return the current sub step from the path', () => {
    const path = ['company', 'name'];
    expect(getCurrentSubStepFromPath(mockStep, path)).toBe('Twenty');
  });

  it('should return undefined when the path is not valid', () => {
    const path = ['company', 'unknown'];
    expect(getCurrentSubStepFromPath(mockStep, path)).toBe(undefined);
  });
});
