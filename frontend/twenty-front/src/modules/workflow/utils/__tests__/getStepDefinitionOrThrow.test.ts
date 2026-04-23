import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';

describe('getStepDefinitionOrThrow', () => {
  const mockTrigger: WorkflowTrigger = {
    type: 'DATABASE_EVENT',
    settings: {
      eventName: 'company.created',
      outputSchema: {},
    },
  };

  const mockSteps: WorkflowAction[] = [
    {
      id: 'step-1',
      name: 'Create Record',
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
    } as WorkflowAction,
    {
      id: 'step-2',
      name: 'Update Record',
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
    } as WorkflowAction,
  ];

  describe('when stepId is TRIGGER_STEP_ID', () => {
    it('should return trigger definition when trigger is provided', () => {
      const result = getStepDefinitionOrThrow({
        stepId: TRIGGER_STEP_ID,
        trigger: mockTrigger,
        steps: mockSteps,
      });

      expect(result).toEqual({
        type: 'trigger',
        definition: mockTrigger,
      });
    });

    it('should return undefined trigger definition when trigger is null', () => {
      const result = getStepDefinitionOrThrow({
        stepId: TRIGGER_STEP_ID,
        trigger: null,
        steps: mockSteps,
      });

      expect(result).toEqual({
        type: 'trigger',
        definition: undefined,
      });
    });
  });

  describe('when stepId is not TRIGGER_STEP_ID', () => {
    it('should throw error when steps is null', () => {
      expect(() => {
        getStepDefinitionOrThrow({
          stepId: 'step-1',
          trigger: mockTrigger,
          steps: null,
        });
      }).toThrow(
        'Malformed workflow version: missing steps information; be sure to create at least one step before trying to edit one',
      );
    });

    it('should return action definition for existing step', () => {
      const result = getStepDefinitionOrThrow({
        stepId: 'step-1',
        trigger: mockTrigger,
        steps: mockSteps,
      });

      expect(result).toEqual({
        type: 'action',
        definition: mockSteps[0],
      });
    });

    it('should return action definition for second step', () => {
      const result = getStepDefinitionOrThrow({
        stepId: 'step-2',
        trigger: mockTrigger,
        steps: mockSteps,
      });

      expect(result).toEqual({
        type: 'action',
        definition: mockSteps[1],
      });
    });

    it('should return undefined for non-existent step', () => {
      const result = getStepDefinitionOrThrow({
        stepId: 'non-existent-step',
        trigger: mockTrigger,
        steps: mockSteps,
      });

      expect(result).toBeUndefined();
    });

    it('should work with empty steps array', () => {
      const result = getStepDefinitionOrThrow({
        stepId: 'step-1',
        trigger: mockTrigger,
        steps: [],
      });

      expect(result).toBeUndefined();
    });
  });
});
