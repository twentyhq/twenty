import { buildLogicFunctionTimeoutResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-logic-function-timeout-result.util';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

describe('buildLogicFunctionTimeoutResult', () => {
  it('returns an ERROR result for a timeout', () => {
    const result = buildLogicFunctionTimeoutResult(30_000);

    expect(result.status).toBe(LogicFunctionExecutionStatus.ERROR);
    expect(result.data).toBeNull();
    expect(result.error?.errorType).toBe('TimeoutError');
    expect(result.error?.errorMessage).toBe(
      'Function execution timed out after 30s',
    );
    expect(result.duration).toBe(30_000);
  });

  it('rounds the timeout to whole seconds', () => {
    expect(buildLogicFunctionTimeoutResult(900_000).error?.errorMessage).toBe(
      'Function execution timed out after 900s',
    );
    expect(buildLogicFunctionTimeoutResult(1_500).error?.errorMessage).toBe(
      'Function execution timed out after 2s',
    );
  });
});
