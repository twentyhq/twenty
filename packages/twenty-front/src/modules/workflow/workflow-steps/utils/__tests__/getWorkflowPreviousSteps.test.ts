import { type WorkflowStep } from '@/workflow/types/Workflow';
import { getPreviousSteps } from '@/workflow/workflow-steps/utils/getWorkflowPreviousSteps';

describe('getWorkflowPreviousSteps', () => {
  describe('using a simple workflow', () => {
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

    it('should return empty array when there are no previous steps', () => {
      const result = getPreviousSteps({
        steps: mockWorkflow,
        currentStep: mockWorkflow[0],
      });
      expect(result).toEqual([]);
    });

    it('should return direct previous steps', () => {
      const result = getPreviousSteps({
        steps: mockWorkflow,
        currentStep: mockWorkflow[1],
      });
      expect(result).toEqual([mockWorkflow[0]]);
    });

    it('should return all previous steps including indirect ones', () => {
      const result = getPreviousSteps({
        steps: mockWorkflow,
        currentStep: mockWorkflow[3],
      });
      expect(result).toEqual([
        mockWorkflow[0],
        mockWorkflow[1],
        mockWorkflow[2],
      ]);
    });

    it('should handle circular dependencies', () => {
      const circularWorkflow = [...mockWorkflow];
      circularWorkflow[3].nextStepIds = ['step1']; // Make step4 point back to step1

      const result = getPreviousSteps({
        steps: circularWorkflow,
        currentStep: circularWorkflow[3],
      });
      expect(result).toEqual([
        mockWorkflow[0],
        mockWorkflow[1],
        mockWorkflow[2],
      ]);
    });
  });

  describe('using a workflow with an iterator', () => {
    const mockWorkflowWithIterator = [
      {
        id: 'iterator1',
        name: 'Iterator Step',
        type: 'ITERATOR',
        valid: true,
        nextStepIds: ['step3'],
        settings: {
          input: {
            initialLoopStepIds: ['step2'],
          },
        },
      },
      {
        id: 'step2',
        name: 'Second Step',
        type: 'CODE',
        valid: true,
        nextStepIds: ['iterator1'],
        settings: {},
      },
      {
        id: 'step3',
        name: 'Third Step',
        type: 'CODE',
        valid: true,
        nextStepIds: [],
        settings: {},
      },
    ] as WorkflowStep[];

    it('should consider iterator step as parent of loop steps', () => {
      const result = getPreviousSteps({
        steps: mockWorkflowWithIterator,
        currentStep: mockWorkflowWithIterator[1],
      });

      expect(result).toEqual([mockWorkflowWithIterator[0]]);
    });

    it('should not consider loop step as parent of iterator', () => {
      const result = getPreviousSteps({
        steps: mockWorkflowWithIterator,
        currentStep: mockWorkflowWithIterator[0],
      });

      expect(result).toEqual([]);
    });

    it('should consider iterator step as parent of non-loop steps', () => {
      const result = getPreviousSteps({
        steps: mockWorkflowWithIterator,
        currentStep: mockWorkflowWithIterator[2],
      });

      expect(result).toEqual([mockWorkflowWithIterator[0]]);
    });
  });
});
