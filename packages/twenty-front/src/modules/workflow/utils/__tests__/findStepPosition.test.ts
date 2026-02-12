import { type WorkflowStep } from '@/workflow/types/Workflow';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { findStepPosition } from '@/workflow/utils/findStepPosition';

describe('findStepPosition', () => {
  const mockSteps: WorkflowStep[] = [
    {
      id: 'step-1',
      name: 'First Step',
      type: 'CREATE_RECORD',
      valid: true,
      settings: {
        errorHandlingOptions: {
          continueOnFailure: { value: false },
          retryOnFailure: { value: false },
        },
        input: {
          objectName: 'Company',
          objectRecord: {},
        },
        outputSchema: {},
      },
    } as WorkflowStep,
    {
      id: 'step-2',
      name: 'Second Step',
      type: 'UPDATE_RECORD',
      valid: true,
      settings: {
        errorHandlingOptions: {
          continueOnFailure: { value: false },
          retryOnFailure: { value: false },
        },
        input: {
          objectName: 'Company',
          objectRecord: {},
          objectRecordId: 'test-id',
          fieldsToUpdate: ['name'],
        },
        outputSchema: {},
      },
    } as WorkflowStep,
    {
      id: 'step-3',
      name: 'Third Step',
      type: 'DELETE_RECORD',
      valid: true,
      settings: {
        errorHandlingOptions: {
          continueOnFailure: { value: false },
          retryOnFailure: { value: false },
        },
        input: {
          objectName: 'Company',
          objectRecordId: 'test-id',
        },
        outputSchema: {},
      },
    } as WorkflowStep,
  ];

  it('should return index 0 when stepId is undefined', () => {
    const result = findStepPosition({
      steps: mockSteps,
      stepId: undefined,
    });

    expect(result).toEqual({
      steps: mockSteps,
      index: 0,
    });
  });

  it('should return index 0 when stepId is TRIGGER_STEP_ID', () => {
    const result = findStepPosition({
      steps: mockSteps,
      stepId: TRIGGER_STEP_ID,
    });

    expect(result).toEqual({
      steps: mockSteps,
      index: 0,
    });
  });

  it('should find the correct position for an existing step', () => {
    const result = findStepPosition({
      steps: mockSteps,
      stepId: 'step-2',
    });

    expect(result).toEqual({
      steps: mockSteps,
      index: 1,
    });
  });

  it('should find the first step position', () => {
    const result = findStepPosition({
      steps: mockSteps,
      stepId: 'step-1',
    });

    expect(result).toEqual({
      steps: mockSteps,
      index: 0,
    });
  });

  it('should find the last step position', () => {
    const result = findStepPosition({
      steps: mockSteps,
      stepId: 'step-3',
    });

    expect(result).toEqual({
      steps: mockSteps,
      index: 2,
    });
  });

  it('should return undefined for non-existent stepId', () => {
    const result = findStepPosition({
      steps: mockSteps,
      stepId: 'non-existent-step',
    });

    expect(result).toBeUndefined();
  });

  it('should work with empty steps array', () => {
    const result = findStepPosition({
      steps: [],
      stepId: 'step-1',
    });

    expect(result).toBeUndefined();
  });

  it('should work with single step array', () => {
    const singleStep = [mockSteps[0]];
    const result = findStepPosition({
      steps: singleStep,
      stepId: 'step-1',
    });

    expect(result).toEqual({
      steps: singleStep,
      index: 0,
    });
  });
});
