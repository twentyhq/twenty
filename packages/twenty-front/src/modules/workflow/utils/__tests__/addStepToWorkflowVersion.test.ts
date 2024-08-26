import { WorkflowStep, WorkflowVersion } from '@/workflow/types/Workflow';
import { addStepToWorkflowVersion } from '../addStepToWorkflowVersion';

describe('addStepToWorkflowVersion', () => {
  it('adds the step when the steps array is empty', () => {
    const workflowVersionInitial: WorkflowVersion = {
      __typename: 'WorkflowVersion',
      createdAt: '',
      id: '1',
      name: '',
      steps: [],
      trigger: {
        settings: { eventName: 'company.created' },
        type: 'DATABASE_EVENT',
      },
      updatedAt: '',
      workflowId: '',
    };
    const nodeToAdd: WorkflowStep = {
      id: 'step-1',
      name: '',
      settings: {
        errorHandlingOptions: {
          retryOnFailure: { value: true },
          continueOnFailure: { value: false },
        },
        serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
      },
      type: 'CODE_ACTION',
      valid: true,
    };

    const workflowVersionUpdated = addStepToWorkflowVersion({
      workflowVersion: workflowVersionInitial,
      nodeToAdd,
      parentNodeId: undefined,
    });

    const expectedUpdatedSteps: Array<WorkflowStep> = [nodeToAdd];
    expect(workflowVersionUpdated.steps).toEqual(expectedUpdatedSteps);
  });

  it('adds the step at the end of a non-empty steps array', () => {
    const workflowVersionInitial: WorkflowVersion = {
      __typename: 'WorkflowVersion',
      createdAt: '',
      id: '1',
      name: '',
      steps: [
        {
          id: 'step-1',
          name: '',
          settings: {
            errorHandlingOptions: {
              retryOnFailure: { value: true },
              continueOnFailure: { value: false },
            },
            serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
          },
          type: 'CODE_ACTION',
          valid: true,
        },
        {
          id: 'step-2',
          name: '',
          settings: {
            errorHandlingOptions: {
              retryOnFailure: { value: true },
              continueOnFailure: { value: false },
            },
            serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
          },
          type: 'CODE_ACTION',
          valid: true,
        },
      ],
      trigger: {
        settings: { eventName: 'company.created' },
        type: 'DATABASE_EVENT',
      },
      updatedAt: '',
      workflowId: '',
    };
    const nodeToAdd: WorkflowStep = {
      id: 'step-3',
      name: '',
      settings: {
        errorHandlingOptions: {
          retryOnFailure: { value: true },
          continueOnFailure: { value: false },
        },
        serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
      },
      type: 'CODE_ACTION',
      valid: true,
    };

    const workflowVersionUpdated = addStepToWorkflowVersion({
      workflowVersion: workflowVersionInitial,
      nodeToAdd,
      parentNodeId: workflowVersionInitial.steps[1].id, // Note the selected step.
    });

    const expectedUpdatedSteps: Array<WorkflowStep> = [
      workflowVersionInitial.steps[0],
      workflowVersionInitial.steps[1],
      nodeToAdd,
    ];
    expect(workflowVersionUpdated.steps).toEqual(expectedUpdatedSteps);
  });

  it('adds the step in the middle of a non-empty steps array', () => {
    const workflowVersionInitial: WorkflowVersion = {
      __typename: 'WorkflowVersion',
      createdAt: '',
      id: '1',
      name: '',
      steps: [
        {
          id: 'step-1',
          name: '',
          settings: {
            errorHandlingOptions: {
              retryOnFailure: { value: true },
              continueOnFailure: { value: false },
            },
            serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
          },
          type: 'CODE_ACTION',
          valid: true,
        },
        {
          id: 'step-2',
          name: '',
          settings: {
            errorHandlingOptions: {
              retryOnFailure: { value: true },
              continueOnFailure: { value: false },
            },
            serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
          },
          type: 'CODE_ACTION',
          valid: true,
        },
      ],
      trigger: {
        settings: { eventName: 'company.created' },
        type: 'DATABASE_EVENT',
      },
      updatedAt: '',
      workflowId: '',
    };
    const nodeToAdd: WorkflowStep = {
      id: 'step-3',
      name: '',
      settings: {
        errorHandlingOptions: {
          retryOnFailure: { value: true },
          continueOnFailure: { value: false },
        },
        serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
      },
      type: 'CODE_ACTION',
      valid: true,
    };

    const workflowVersionUpdated = addStepToWorkflowVersion({
      workflowVersion: workflowVersionInitial,
      nodeToAdd,
      parentNodeId: workflowVersionInitial.steps[0].id, // Note the selected step.
    });

    const expectedUpdatedSteps: Array<WorkflowStep> = [
      workflowVersionInitial.steps[0],
      nodeToAdd,
      workflowVersionInitial.steps[1],
    ];
    expect(workflowVersionUpdated.steps).toEqual(expectedUpdatedSteps);
  });
});
