import { LOGIC_FUNCTION_HTTP_RESPONSE_MARKER } from 'twenty-shared/types';

import { isServerLogicFunctionResult } from 'src/engine/core-modules/server-logic-function-executor/utils/is-server-logic-function-result.util';

describe('isServerLogicFunctionResult', () => {
  it('accepts a valid result without a response', () => {
    expect(isServerLogicFunctionResult({ workspaceIds: ['a'] })).toBe(true);
  });

  it('accepts a valid result with a wrapped HTTP response', () => {
    expect(
      isServerLogicFunctionResult({
        workspaceIds: [],
        response: {
          [LOGIC_FUNCTION_HTTP_RESPONSE_MARKER]: true,
          status: 200,
          body: { ok: true },
        },
      }),
    ).toBe(true);
  });

  it('rejects an unwrapped response shape', () => {
    expect(
      isServerLogicFunctionResult({
        workspaceIds: [],
        response: { status: 200 },
      }),
    ).toBe(false);
  });

  it('rejects invalid shapes', () => {
    expect(isServerLogicFunctionResult(null)).toBe(false);
    expect(isServerLogicFunctionResult({})).toBe(false);
    expect(isServerLogicFunctionResult({ workspaceIds: 'x' })).toBe(false);
    expect(isServerLogicFunctionResult({ workspaceIds: [1] })).toBe(false);
  });
});
