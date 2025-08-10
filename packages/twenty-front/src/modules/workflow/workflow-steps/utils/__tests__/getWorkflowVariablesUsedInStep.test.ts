import { type WorkflowStep } from '@/workflow/types/Workflow';
import { getWorkflowVariablesUsedInStep } from '@/workflow/workflow-steps/utils/getWorkflowVariablesUsedInStep';

describe('getWorkflowVariablesUsedInStep', () => {
  it('returns the variables used in a one-level object', () => {
    const step: WorkflowStep = {
      id: '42e8b60e-dd44-417a-875f-823d63f16819',
      name: 'Code - Serverless Function',
      type: 'CODE',
      valid: false,
      settings: {
        input: {
          serverlessFunctionId: '5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2d',
          serverlessFunctionInput: {
            a: '{{5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.a.b.c.d}}',
          },
          serverlessFunctionVersion: 'draft',
        },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: {
            value: false,
          },
          continueOnFailure: {
            value: false,
          },
        },
      },
    };

    expect(
      getWorkflowVariablesUsedInStep({
        step,
      }),
    ).toMatchInlineSnapshot(`
Set {
  "5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.a.b.c.d",
}
`);
  });

  it('returns the variables used in a computed field', () => {
    const step: WorkflowStep = {
      id: '42e8b60e-dd44-417a-875f-823d63f16819',
      name: 'Create Record',
      type: 'CREATE_RECORD',
      valid: false,
      settings: {
        input: {
          objectName: 'company',
          objectRecord: {
            name: 'Test',
            address: {
              addressLat: null,
              addressLng: null,
              addressCity: '{{trigger.address.addressCity}}',
              addressState: '{{trigger.address.addressState}}',
              addressCountry: '{{trigger.address.addressCountry}}',
              addressStreet1: '{{trigger.address.addressStreet1}}',
              addressStreet2: '{{trigger.address.addressStreet2}}',
              addressPostcode: '{{trigger.address.addressPostcode}}',
            },
            domainName: {
              primaryLinkUrl: '',
              primaryLinkLabel: '',
            },
          },
        },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: {
            value: false,
          },
          continueOnFailure: {
            value: false,
          },
        },
      },
    };

    expect(
      getWorkflowVariablesUsedInStep({
        step,
      }),
    ).toMatchInlineSnapshot(`
Set {
  "trigger.address.addressCity",
  "trigger.address.addressState",
  "trigger.address.addressCountry",
  "trigger.address.addressStreet1",
  "trigger.address.addressStreet2",
  "trigger.address.addressPostcode",
}
`);
  });

  it('returns all the variables used in a single field', () => {
    const step: WorkflowStep = {
      id: '42e8b60e-dd44-417a-875f-823d63f16819',
      name: 'Code - Serverless Function',
      type: 'CODE',
      valid: false,
      settings: {
        input: {
          serverlessFunctionId: '5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2d',
          serverlessFunctionInput: {
            a: '{{5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.a}} {{5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.b}} {{5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.c}} {{5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.d}}',
          },
          serverlessFunctionVersion: 'draft',
        },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: {
            value: false,
          },
          continueOnFailure: {
            value: false,
          },
        },
      },
    };

    expect(
      getWorkflowVariablesUsedInStep({
        step,
      }),
    ).toMatchInlineSnapshot(`
Set {
  "5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.a",
  "5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.b",
  "5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.c",
  "5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.d",
}
`);
  });

  it('returns the variables used many times only once', () => {
    const step: WorkflowStep = {
      id: '42e8b60e-dd44-417a-875f-823d63f16819',
      name: 'Code - Serverless Function',
      type: 'CODE',
      valid: false,
      settings: {
        input: {
          serverlessFunctionId: '5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2d',
          serverlessFunctionInput: {
            a: '{{5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.a}} {{5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.a}} {{5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.a}} {{5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.a}}',
          },
          serverlessFunctionVersion: 'draft',
        },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: {
            value: false,
          },
          continueOnFailure: {
            value: false,
          },
        },
      },
    };

    expect(
      getWorkflowVariablesUsedInStep({
        step,
      }),
    ).toMatchInlineSnapshot(`
Set {
  "5f7b9b44-bb07-41ba-aef8-ec0eaa5eea2c.a",
}
`);
  });
});
