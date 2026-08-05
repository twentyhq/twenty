import { DEPENDENCIES_SIZE_EXCEEDED_ERROR_NAME } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { buildYarnInstallFailureException } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-yarn-install-failure-exception.util';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';

describe('buildYarnInstallFailureException', () => {
  it('should map the dependencies size error type to LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED with the original message', () => {
    const errorMessage =
      'Dependencies size exceeded: production dependencies unpack to 292MB, the maximum is 200MB.';

    const exception = buildYarnInstallFailureException({
      errorType: DEPENDENCIES_SIZE_EXCEEDED_ERROR_NAME,
      errorMessage,
    });

    expect(exception.code).toBe(
      LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
    );
    expect(exception.message).toBe(errorMessage);
  });

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
