import { WorkflowStep, WorkflowVersion } from '@/workflow/types/Workflow';
import { replaceStep } from '../replaceStep';

describe('replaceStep', () => {
  it('returns a deep copy of the provided steps array instead of mutating it', () => {
    const stepToBeReplaced = {
      id: 'step-1',
      name: '',
      settings: {
        errorHandlingOptions: {
          retryOnFailure: { value: true },
          continueOnFailure: { value: false },
        },
        input: {
          serverlessFunctionId: 'first',
          serverlessFunctionVersion: '1',
          serverlessFunctionInput: {},
        },
        outputSchema: {},
      },
      type: 'CODE',
      valid: true,
    } satisfies WorkflowStep;
    const workflowVersionInitial = {
      __typename: 'WorkflowVersion',
      status: 'ACTIVE',
      createdAt: '',
      id: '1',
      name: '',
      steps: [stepToBeReplaced],
      trigger: {
        name: 'Company created',
        settings: { eventName: 'company.created', outputSchema: {} },
        type: 'DATABASE_EVENT',
      },
      updatedAt: '',
      workflowId: '',
    } satisfies WorkflowVersion;

    const stepsUpdated = replaceStep({
      steps: workflowVersionInitial.steps,
      stepToReplace: {
        settings: {
          errorHandlingOptions: {
            retryOnFailure: { value: true },
            continueOnFailure: { value: false },
          },
          input: {
            serverlessFunctionId: 'second',
            serverlessFunctionVersion: '1',
            serverlessFunctionInput: {},
          },
          outputSchema: {},
        },
      },
      stepId: stepToBeReplaced.id,
    });

    expect(workflowVersionInitial.steps).not.toBe(stepsUpdated);
  });

  it('replaces a step in a non-empty steps array', () => {
    const stepToBeReplaced: WorkflowStep = {
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
    };
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
        stepToBeReplaced,
        {
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
        },
      ],
      trigger: {
        name: 'Company created',
        settings: {
          eventName: 'company.created',
          outputSchema: {},
        },
        type: 'DATABASE_EVENT',
      },
      updatedAt: '',
      workflowId: '',
    } satisfies WorkflowVersion;

    const updatedStepName = "that's another name";
    const stepsUpdated = replaceStep({
      stepId: stepToBeReplaced.id,
      steps: workflowVersionInitial.steps,
      stepToReplace: {
        name: updatedStepName,
      },
    });

    const expectedUpdatedSteps: Array<WorkflowStep> = [
      workflowVersionInitial.steps[0],
      {
        ...stepToBeReplaced,
        name: updatedStepName,
      },
      workflowVersionInitial.steps[2],
    ];
    expect(stepsUpdated).toEqual(expectedUpdatedSteps);
  });
});
