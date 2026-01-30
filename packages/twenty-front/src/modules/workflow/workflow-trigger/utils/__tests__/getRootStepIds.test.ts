import { type WorkflowAction } from '@/workflow/types/Workflow';
import { getRootStepIds } from '@/workflow/workflow-trigger/utils/getRootStepIds';

describe('getRootStepIds', () => {
  it('should return empty array for empty steps', () => {
    const result = getRootStepIds([]);

    expect(result).toEqual([]);
  });

  it('should return single step id when only one step exists', () => {
    const steps: WorkflowAction[] = [
      {
        id: 'step-1',
        name: 'Step 1',
        type: 'CREATE_RECORD',
        valid: true,
        settings: {} as any,
      },
    ];

    const result = getRootStepIds(steps);

    expect(result).toEqual(['step-1']);
  });

  it('should return root step ids (steps not referenced by other steps)', () => {
    const steps: WorkflowAction[] = [
      {
        id: 'step-1',
        name: 'Root Step',
        type: 'CREATE_RECORD',
        valid: true,
        settings: {} as any,
        nextStepIds: ['step-2'],
      },
      {
        id: 'step-2',
        name: 'Child Step',
        type: 'UPDATE_RECORD',
        valid: true,
        settings: {} as any,
      },
    ];

    const result = getRootStepIds(steps);

    expect(result).toEqual(['step-1']);
  });

  it('should return multiple root steps when there are parallel branches', () => {
    const steps: WorkflowAction[] = [
      {
        id: 'step-1',
        name: 'Root 1',
        type: 'CREATE_RECORD',
        valid: true,
        settings: {} as any,
        nextStepIds: ['step-3'],
      },
      {
        id: 'step-2',
        name: 'Root 2',
        type: 'UPDATE_RECORD',
        valid: true,
        settings: {} as any,
        nextStepIds: ['step-3'],
      },
      {
        id: 'step-3',
        name: 'Child',
        type: 'SEND_EMAIL',
        valid: true,
        settings: {} as any,
      },
    ];

    const result = getRootStepIds(steps);

    expect(result).toEqual(['step-1', 'step-2']);
  });

  it('should handle steps with undefined nextStepIds', () => {
    const steps: WorkflowAction[] = [
      {
        id: 'step-1',
        name: 'Step 1',
        type: 'CREATE_RECORD',
        valid: true,
        settings: {} as any,
        nextStepIds: undefined,
      },
      {
        id: 'step-2',
        name: 'Step 2',
        type: 'UPDATE_RECORD',
        valid: true,
        settings: {} as any,
      },
    ];

    const result = getRootStepIds(steps);

    expect(result).toEqual(['step-1', 'step-2']);
  });

  it('should handle complex workflow with multiple levels', () => {
    const steps: WorkflowAction[] = [
      {
        id: 'root',
        name: 'Root',
        type: 'CREATE_RECORD',
        valid: true,
        settings: {} as any,
        nextStepIds: ['level-1-a', 'level-1-b'],
      },
      {
        id: 'level-1-a',
        name: 'Level 1 A',
        type: 'UPDATE_RECORD',
        valid: true,
        settings: {} as any,
        nextStepIds: ['level-2'],
      },
      {
        id: 'level-1-b',
        name: 'Level 1 B',
        type: 'SEND_EMAIL',
        valid: true,
        settings: {} as any,
        nextStepIds: ['level-2'],
      },
      {
        id: 'level-2',
        name: 'Level 2',
        type: 'DELETE_RECORD',
        valid: true,
        settings: {} as any,
      },
    ];

    const result = getRootStepIds(steps);

    expect(result).toEqual(['root']);
  });
});
