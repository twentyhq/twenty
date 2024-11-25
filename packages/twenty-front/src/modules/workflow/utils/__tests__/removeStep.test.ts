import { WorkflowStep, WorkflowVersion } from '@/workflow/types/Workflow';
import { removeStep } from '../removeStep';

it('returns a deep copy of the provided steps array instead of mutating it', () => {
  const stepToBeRemoved = {
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
    steps: [stepToBeRemoved],
    trigger: {
      name: 'Company created',
      settings: { eventName: 'company.created', outputSchema: {} },
      type: 'DATABASE_EVENT',
    },
    updatedAt: '',
    workflowId: '',
  } satisfies WorkflowVersion;

  const stepsUpdated = removeStep({
    steps: workflowVersionInitial.steps,
    stepId: stepToBeRemoved.id,
  });

  expect(workflowVersionInitial.steps).not.toBe(stepsUpdated);
});

it('removes a step in a non-empty steps array', () => {
  const stepToBeRemoved: WorkflowStep = {
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
      stepToBeRemoved,
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
      settings: { eventName: 'company.created', outputSchema: {} },
      type: 'DATABASE_EVENT',
    },
    updatedAt: '',
    workflowId: '',
  } satisfies WorkflowVersion;

  const stepsUpdated = removeStep({
    steps: workflowVersionInitial.steps,
    stepId: stepToBeRemoved.id,
  });

  const expectedUpdatedSteps: Array<WorkflowStep> = [
    workflowVersionInitial.steps[0],
    workflowVersionInitial.steps[2],
  ];
  expect(stepsUpdated).toEqual(expectedUpdatedSteps);
});
