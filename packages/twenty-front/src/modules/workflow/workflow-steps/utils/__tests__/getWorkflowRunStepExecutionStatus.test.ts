import { getWorkflowRunStepExecutionStatus } from '@/workflow/workflow-steps/utils/getWorkflowRunStepExecutionStatus';
import { StepStatus } from 'twenty-shared/workflow';

describe('getWorkflowRunStepExecutionStatus', () => {
  const stepId = '453e0084-aca2-45b9-8d1c-458a2b8ac70a';

  it('should return not-executed when the output is null', () => {
    expect(
      getWorkflowRunStepExecutionStatus({
        workflowRunState: null,
        stepId,
      }),
    ).toBe(StepStatus.NOT_STARTED);
  });

  it('should return success when step has result', () => {
    expect(
      getWorkflowRunStepExecutionStatus({
        workflowRunState: {
          flow: {
            steps: [
              {
                id: stepId,
                name: 'Code - Serverless Function',
                type: 'CODE',
                valid: false,
                settings: {
                  input: {
                    serverlessFunctionId:
                      '5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c',
                    serverlessFunctionInput: {
                      a: null,
                      b: null,
                    },
                    serverlessFunctionVersion: 'draft',
                  },
                  outputSchema: {
                    link: {
                      tab: 'test',
                      icon: 'IconVariable',
                      label: 'Generate Function Output',
                      isLeaf: true,
                    },
                    _outputSchemaType: 'LINK',
                  },
                  errorHandlingOptions: {
                    retryOnFailure: {
                      value: false,
                    },
                    continueOnFailure: {
                      value: false,
                    },
                  },
                },
              },
            ],
            trigger: {
              type: 'MANUAL',
              settings: {
                outputSchema: {},
              },
            },
          },
          stepInfos: {
            trigger: {
              result: {},
              status: StepStatus.SUCCESS,
            },
            [stepId]: {
              result: {},
              status: StepStatus.SUCCESS,
            },
          },
        },
        stepId,
      }),
    ).toBe(StepStatus.SUCCESS);
  });

  it('should return failure when workflow has error', () => {
    const error = 'fn(...).then is not a function';

    expect(
      getWorkflowRunStepExecutionStatus({
        workflowRunState: {
          flow: {
            steps: [
              {
                id: stepId,
                name: 'Code - Serverless Function',
                type: 'CODE',
                valid: false,
                settings: {
                  input: {
                    serverlessFunctionId:
                      '5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c',
                    serverlessFunctionInput: {
                      a: null,
                      b: null,
                    },
                    serverlessFunctionVersion: 'draft',
                  },
                  outputSchema: {
                    link: {
                      tab: 'test',
                      icon: 'IconVariable',
                      label: 'Generate Function Output',
                      isLeaf: true,
                    },
                    _outputSchemaType: 'LINK',
                  },
                  errorHandlingOptions: {
                    retryOnFailure: {
                      value: false,
                    },
                    continueOnFailure: {
                      value: false,
                    },
                  },
                },
              },
            ],
            trigger: {
              type: 'MANUAL',
              settings: {
                outputSchema: {},
              },
            },
          },
          workflowRunError: error,
          stepInfos: {
            trigger: {
              result: {},
              status: StepStatus.SUCCESS,
            },
            [stepId]: {
              error,
              status: StepStatus.FAILED,
            },
          },
        },
        stepId,
      }),
    ).toBe(StepStatus.FAILED);
  });

  it('should return not-executed when step has no output', () => {
    const secondStepId = '5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c';

    expect(
      getWorkflowRunStepExecutionStatus({
        workflowRunState: {
          flow: {
            steps: [
              {
                id: stepId,
                name: 'Code - Serverless Function',
                type: 'CODE',
                valid: false,
                settings: {
                  input: {
                    serverlessFunctionId:
                      '5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c',
                    serverlessFunctionInput: {
                      a: null,
                      b: null,
                    },
                    serverlessFunctionVersion: 'draft',
                  },
                  outputSchema: {
                    link: {
                      tab: 'test',
                      icon: 'IconVariable',
                      label: 'Generate Function Output',
                      isLeaf: true,
                    },
                    _outputSchemaType: 'LINK',
                  },
                  errorHandlingOptions: {
                    retryOnFailure: {
                      value: false,
                    },
                    continueOnFailure: {
                      value: false,
                    },
                  },
                },
              },
              {
                id: secondStepId,
                name: 'Code - Serverless Function',
                type: 'CODE',
                valid: false,
                settings: {
                  input: {
                    serverlessFunctionId:
                      '5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c',
                    serverlessFunctionInput: {
                      a: null,
                      b: null,
                    },
                    serverlessFunctionVersion: 'draft',
                  },
                  outputSchema: {
                    link: {
                      tab: 'test',
                      icon: 'IconVariable',
                      label: 'Generate Function Output',
                      isLeaf: true,
                    },
                    _outputSchemaType: 'LINK',
                  },
                  errorHandlingOptions: {
                    retryOnFailure: {
                      value: false,
                    },
                    continueOnFailure: {
                      value: false,
                    },
                  },
                },
              },
            ],
            trigger: {
              type: 'MANUAL',
              settings: {
                outputSchema: {},
              },
            },
          },
          stepInfos: {
            trigger: {
              result: {},
              status: StepStatus.SUCCESS,
            },
            [stepId]: {
              result: {},
              status: StepStatus.SUCCESS,
            },
            [secondStepId]: {
              result: {},
              status: StepStatus.NOT_STARTED,
            },
          },
        },
        stepId: secondStepId,
      }),
    ).toBe(StepStatus.NOT_STARTED);
  });
});
