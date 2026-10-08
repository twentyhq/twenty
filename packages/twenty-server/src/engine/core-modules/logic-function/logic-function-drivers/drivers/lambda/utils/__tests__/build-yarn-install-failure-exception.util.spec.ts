import { buildYarnInstallFailureException } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-yarn-install-failure-exception.util';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';

describe('buildYarnInstallFailureException', () => {
  it('should map an out-of-memory kill to LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED', () => {
    const exception = buildYarnInstallFailureException({
      errorType: 'Runtime.OutOfMemory',
      errorMessage: 'Error: Runtime exited with error: signal: killed',
    });

    expect(exception.code).toBe(
      LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
    );
  });

  it('should map any other failure to LOGIC_FUNCTION_CREATE_FAILED', () => {
    const exception = buildYarnInstallFailureException({
      errorType: 'Error',
      errorMessage: 'yarn install failed: ENETDOWN',
    });

    expect(exception.code).toBe(
      LogicFunctionExceptionCode.LOGIC_FUNCTION_CREATE_FAILED,
    );
  });

  it('should map an empty payload to LOGIC_FUNCTION_CREATE_FAILED', () => {
    const exception = buildYarnInstallFailureException({});

    expect(exception.code).toBe(
      LogicFunctionExceptionCode.LOGIC_FUNCTION_CREATE_FAILED,
    );
  });
});
