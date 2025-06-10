import { getWorkflowRunStepExecutionStatus } from '../getWorkflowRunStepExecutionStatus';

describe('getWorkflowRunStepExecutionStatus', () => {
  const stepId = '453e0084-aca2-45b9-8d1c-458a2b8ac70a';

  it('should return not-executed when the output is null', () => {
    expect(
      getWorkflowRunStepExecutionStatus({
        workflowRunOutput: null,
        stepId,
      }),
    ).toBe('not-executed');
  });

  it('should return success when step has result', () => {
    expect(
      getWorkflowRunStepExecutionStatus({
        workflowRunOutput: {
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
          stepsOutput: {
            [stepId]: {
              result: {},
            },
          },
        },
        stepId,
      }),
    ).toBe('success');
  });

  it('should return failure when workflow has error', () => {
    const error = 'fn(...).then is not a function';

    expect(
      getWorkflowRunStepExecutionStatus({
        workflowRunOutput: {
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
          error,
          stepsOutput: {
            [stepId]: {
              error,
            },
          },
        },
        stepId,
      }),
    ).toBe('failure');
  });

  it('should return not-executed when step has no output', () => {
    const secondStepId = '5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c';

    expect(
      getWorkflowRunStepExecutionStatus({
        workflowRunOutput: {
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
          stepsOutput: {
            [stepId]: {
              result: {},
            },
          },
        },
        stepId: secondStepId,
      }),
    ).toBe('not-executed');
  });
});
