import { isServerLogicFunctionResult } from 'src/engine/core-modules/server-logic-function-executor/utils/is-server-logic-function-result.util';

describe('isServerLogicFunctionResult', () => {
  it('accepts a valid result', () => {
    expect(isServerLogicFunctionResult({ workspaceIds: ['a'] })).toBe(true);
    expect(
      isServerLogicFunctionResult({
        workspaceIds: [],
        response: { status: 200 },
      }),
    ).toBe(true);
  });

  it('rejects invalid shapes', () => {
    expect(isServerLogicFunctionResult(null)).toBe(false);
    expect(isServerLogicFunctionResult({})).toBe(false);
    expect(isServerLogicFunctionResult({ workspaceIds: 'x' })).toBe(false);
    expect(isServerLogicFunctionResult({ workspaceIds: [1] })).toBe(false);
  });
});
