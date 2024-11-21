import { WorkflowStep, WorkflowVersion } from '@/workflow/types/Workflow';
import { insertStep } from '../insertStep';

describe('insertStep', () => {
  it('returns a deep copy of the provided steps array instead of mutating it', () => {
    const workflowVersionInitial = {
      __typename: 'WorkflowVersion',
      status: 'ACTIVE',
      createdAt: '',
      id: '1',
      name: '',
      steps: [],
      trigger: {
        name: 'Company created',
        settings: { eventName: 'company.created', outputSchema: {} },
        type: 'DATABASE_EVENT',
      },
      updatedAt: '',
      workflowId: '',
    } satisfies WorkflowVersion;
    const stepToAdd: WorkflowStep = {
      id: 'step-1',
      name: '',
      settings: {
        errorHandlingOptions: {
          retryOnFailure: { value: true },
          continueOnFailure: { value: false },
        },
        input: {
          serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
          serverlessFunctionVersion: '1',
          serverlessFunctionInput: {},
        },
        outputSchema: {},
      },
      type: 'CODE',
      valid: true,
    };

    const stepsUpdated = insertStep({
      steps: workflowVersionInitial.steps,
      stepToAdd,
      parentStepId: undefined,
    });

    expect(workflowVersionInitial.steps).not.toBe(stepsUpdated);
  });

  it('adds the step when the steps array is empty', () => {
    const workflowVersionInitial = {
      __typename: 'WorkflowVersion',
      status: 'ACTIVE',
      createdAt: '',
      id: '1',
      name: '',
      steps: [],
      trigger: {
        name: 'Company created',
        settings: { eventName: 'company.created', outputSchema: {} },
        type: 'DATABASE_EVENT',
      },
      updatedAt: '',
      workflowId: '',
    } satisfies WorkflowVersion;
    const stepToAdd: WorkflowStep = {
      id: 'step-1',
      name: '',
      settings: {
        errorHandlingOptions: {
          retryOnFailure: { value: true },
          continueOnFailure: { value: false },
        },
        input: {
          serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
          serverlessFunctionVersion: '1',
          serverlessFunctionInput: {},
        },
        outputSchema: {},
      },
      type: 'CODE',
      valid: true,
    };

    const stepsUpdated = insertStep({
      steps: workflowVersionInitial.steps,
      stepToAdd,
      parentStepId: undefined,
    });

    const expectedUpdatedSteps: Array<WorkflowStep> = [stepToAdd];
    expect(stepsUpdated).toEqual(expectedUpdatedSteps);
  });

  it('adds the step at the end of a non-empty steps array', () => {
    const workflowVersionInitial = {
      __typename: 'WorkflowVersion',
      status: 'ACTIVE',
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
            input: {
              serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
              serverlessFunctionVersion: '1',
              serverlessFunctionInput: {},
            },
            outputSchema: {},
          },
          type: 'CODE',
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
            input: {
              serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
              serverlessFunctionVersion: '1',
              serverlessFunctionInput: {},
            },
            outputSchema: {},
          },
          type: 'CODE',
          valid: true,
        },
      ],
      trigger: {
        name: 'Company created',
        settings: { eventName: 'company.created', outputSchema: {} },
        type: 'DATABASE_EVENT',
      },
      updatedAt: '',
      workflowId: '',
    } satisfies WorkflowVersion;
    const stepToAdd: WorkflowStep = {
      id: 'step-3',
      name: '',
      settings: {
        errorHandlingOptions: {
          retryOnFailure: { value: true },
          continueOnFailure: { value: false },
        },
        input: {
          serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
          serverlessFunctionVersion: '1',
          serverlessFunctionInput: {},
        },
        outputSchema: {},
      },
      type: 'CODE',
      valid: true,
    };

    const stepsUpdated = insertStep({
      steps: workflowVersionInitial.steps,
      stepToAdd,
      parentStepId: workflowVersionInitial.steps[1].id, // Note the selected step.
    });

    const expectedUpdatedSteps: Array<WorkflowStep> = [
      workflowVersionInitial.steps[0],
      workflowVersionInitial.steps[1],
      stepToAdd,
    ];
    expect(stepsUpdated).toEqual(expectedUpdatedSteps);
  });

  it('adds the step in the middle of a non-empty steps array', () => {
    const workflowVersionInitial = {
      __typename: 'WorkflowVersion',
      status: 'ACTIVE',
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
            input: {
              serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
              serverlessFunctionVersion: '1',
              serverlessFunctionInput: {},
            },
            outputSchema: {},
          },
          type: 'CODE',
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
            input: {
              serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
              serverlessFunctionVersion: '1',
              serverlessFunctionInput: {},
            },
            outputSchema: {},
          },
          type: 'CODE',
          valid: true,
        },
      ],
      trigger: {
        name: 'Company created',
        settings: { eventName: 'company.created', outputSchema: {} },
        type: 'DATABASE_EVENT',
      },
      updatedAt: '',
      workflowId: '',
    } satisfies WorkflowVersion;
    const stepToAdd: WorkflowStep = {
      id: 'step-3',
      name: '',
      settings: {
        errorHandlingOptions: {
          retryOnFailure: { value: true },
          continueOnFailure: { value: false },
        },
        input: {
          serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
          serverlessFunctionVersion: '1',
          serverlessFunctionInput: {},
        },
        outputSchema: {},
      },
      type: 'CODE',
      valid: true,
    };

    const stepsUpdated = insertStep({
      steps: workflowVersionInitial.steps,
      stepToAdd,
      parentStepId: workflowVersionInitial.steps[0].id, // Note the selected step.
    });

    const expectedUpdatedSteps: Array<WorkflowStep> = [
      workflowVersionInitial.steps[0],
      stepToAdd,
      workflowVersionInitial.steps[1],
    ];
    expect(stepsUpdated).toEqual(expectedUpdatedSteps);
  });
});
