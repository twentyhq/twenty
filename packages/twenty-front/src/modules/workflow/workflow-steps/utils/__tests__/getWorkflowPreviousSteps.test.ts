import { WorkflowStep } from '@/workflow/types/Workflow';
import { getPreviousSteps } from '../getWorkflowPreviousSteps';

const mockWorkflow: WorkflowStep[] = [
  {
    id: 'step1',
    name: 'First Step',
    type: 'CODE',
    valid: true,
    nextStepIds: ['step2', 'step3'],
    settings: {
      input: {
        serverlessFunctionId: 'func1',
        serverlessFunctionVersion: '1.0.0',
        serverlessFunctionInput: {},
      },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: true },
        continueOnFailure: { value: true },
      },
    },
  },
  {
    id: 'step2',
    name: 'Second Step',
    type: 'CODE',
    valid: true,
    nextStepIds: ['step4'],
    settings: {
      input: {
        serverlessFunctionId: 'func2',
        serverlessFunctionVersion: '1.0.0',
        serverlessFunctionInput: {},
      },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: true },
        continueOnFailure: { value: true },
      },
    },
  },
  {
    id: 'step3',
    name: 'Third Step',
    type: 'CODE',
    valid: true,
    nextStepIds: ['step4'],
    settings: {
      input: {
        serverlessFunctionId: 'func3',
        serverlessFunctionVersion: '1.0.0',
        serverlessFunctionInput: {},
      },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: true },
        continueOnFailure: { value: true },
      },
    },
  },
  {
    id: 'step4',
    name: 'Fourth Step',
    type: 'CODE',
    valid: true,
    nextStepIds: [],
    settings: {
      input: {
        serverlessFunctionId: 'func4',
        serverlessFunctionVersion: '1.0.0',
        serverlessFunctionInput: {},
      },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: true },
        continueOnFailure: { value: true },
      },
    },
  },
];

describe('getWorkflowPreviousSteps', () => {
  it('should return empty array when there are no previous steps', () => {
    const result = getPreviousSteps(mockWorkflow, 'step1');
    expect(result).toEqual([]);
  });

  it('should return direct previous steps', () => {
    const result = getPreviousSteps(mockWorkflow, 'step2');
    expect(result).toEqual([mockWorkflow[0]]);
  });

  it('should return all previous steps including indirect ones', () => {
    const result = getPreviousSteps(mockWorkflow, 'step4');
    expect(result).toEqual([mockWorkflow[0], mockWorkflow[1], mockWorkflow[2]]);
  });

  it('should handle circular dependencies', () => {
    const circularWorkflow = [...mockWorkflow];
    circularWorkflow[3].nextStepIds = ['step1']; // Make step4 point back to step1

    const result = getPreviousSteps(circularWorkflow, 'step4');
    expect(result).toEqual([mockWorkflow[0], mockWorkflow[1], mockWorkflow[2]]);
  });

  it('should handle non-existent step ID', () => {
    const result = getPreviousSteps(mockWorkflow, 'non-existent-step');
    expect(result).toEqual([]);
  });
});
