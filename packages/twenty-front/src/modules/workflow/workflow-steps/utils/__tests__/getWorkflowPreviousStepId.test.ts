import { WorkflowStep } from '@/workflow/types/Workflow';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { getWorkflowPreviousStepId } from '../getWorkflowPreviousStepId';

describe('getWorkflowPreviousStepId', () => {
  const mockSteps: WorkflowStep[] = [
    {
      id: 'step-1',
      name: 'First Step',
      type: 'CREATE_RECORD',
      valid: true,
      nextStepIds: ['step-2'],
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
      nextStepIds: ['step-3'],
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
      type: 'SEND_EMAIL',
      valid: true,
      settings: {
        errorHandlingOptions: {
          continueOnFailure: { value: false },
          retryOnFailure: { value: false },
        },
        input: {
          connectedAccountId: 'account-id',
          email: 'test@example.com',
        },
        outputSchema: {},
      },
    } as WorkflowStep,
  ];

  it('should return undefined for TRIGGER_STEP_ID', () => {
    const result = getWorkflowPreviousStepId({
      stepId: TRIGGER_STEP_ID,
      steps: mockSteps,
    });

    expect(result).toBeUndefined();
  });

  it('should return TRIGGER_STEP_ID for first step', () => {
    const result = getWorkflowPreviousStepId({
      stepId: 'step-1',
      steps: mockSteps,
    });

    expect(result).toBe(TRIGGER_STEP_ID);
  });

  it('should return previous step ID for middle step', () => {
    const result = getWorkflowPreviousStepId({
      stepId: 'step-2',
      steps: mockSteps,
    });

    expect(result).toBe('step-1');
  });

  it('should return previous step ID for last step', () => {
    const result = getWorkflowPreviousStepId({
      stepId: 'step-3',
      steps: mockSteps,
    });

    expect(result).toBe('step-2');
  });

  it('should return undefined for non-existent step', () => {
    const result = getWorkflowPreviousStepId({
      stepId: 'non-existent-step',
      steps: mockSteps,
    });

    expect(result).toBeUndefined();
  });

  it('should work with single step', () => {
    const singleStep = [mockSteps[0]];

    const result = getWorkflowPreviousStepId({
      stepId: 'step-1',
      steps: singleStep,
    });

    expect(result).toBe(TRIGGER_STEP_ID);
  });

  it('should handle branching workflow with multiple next steps', () => {
    const branchingSteps: WorkflowStep[] = [
      {
        id: 'step-1',
        name: 'First Step',
        type: 'CREATE_RECORD',
        valid: true,
        nextStepIds: ['step-2a', 'step-2b'],
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
        id: 'step-2a',
        name: 'Second Step A',
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
        id: 'step-2b',
        name: 'Second Step B',
        type: 'SEND_EMAIL',
        valid: true,
        settings: {
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
          input: {
            connectedAccountId: 'account-id',
            email: 'test@example.com',
          },
          outputSchema: {},
        },
      } as WorkflowStep,
    ];

    const resultA = getWorkflowPreviousStepId({
      stepId: 'step-2a',
      steps: branchingSteps,
    });

    const resultB = getWorkflowPreviousStepId({
      stepId: 'step-2b',
      steps: branchingSteps,
    });

    expect(resultA).toBe('step-1');
    expect(resultB).toBe('step-1');
  });

  it('should handle workflow where step is not connected to previous steps', () => {
    const disconnectedSteps: WorkflowStep[] = [
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
        name: 'Disconnected Step',
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
    ];

    const result = getWorkflowPreviousStepId({
      stepId: 'step-2',
      steps: disconnectedSteps,
    });

    expect(result).toBeUndefined();
  });
});
