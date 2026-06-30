import { describe, expect, it } from 'vitest';

import { buildLogicFunctionStep } from 'src/logic-functions/utils/build-logic-function-step';

describe('buildLogicFunctionStep', () => {
  it('builds a logic-function step carrying the resolved id and input', () => {
    const step = buildLogicFunctionStep({
      id: 'step-1',
      name: 'Enrich with People Data Labs',
      logicFunctionId: 'logic-function-1',
      logicFunctionInput: { records: '{{trigger.companies}}' },
    });

    expect(step).toEqual({
      id: 'step-1',
      name: 'Enrich with People Data Labs',
      type: 'LOGIC_FUNCTION',
      valid: true,
      settings: {
        input: {
          logicFunctionId: 'logic-function-1',
          logicFunctionInput: { records: '{{trigger.companies}}' },
        },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: false },
          continueOnFailure: { value: false },
        },
      },
      nextStepIds: [],
    });
  });
});
