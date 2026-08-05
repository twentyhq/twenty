import { GetFunctionCommand, InvokeCommand } from '@aws-sdk/client-lambda';

import {
  YARN_INSTALL_LAMBDA_MEMORY_MB,
  YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue('handler-content'),
}));

const buildInvokeResult = (payload: object, functionError?: string) => ({
  FunctionError: functionError,
  Payload: {
    transformToString: () => JSON.stringify(payload),
  },
});

describe('LambdaToolFunctionsService', () => {
  let lambdaClientSend: jest.Mock;
  let service: LambdaToolFunctionsService;

  const setupInvokeResult = (invokeResult: object) => {
    lambdaClientSend.mockImplementation((command) => {
      if (command instanceof GetFunctionCommand) {
        return Promise.resolve({
          Configuration: {
            MemorySize: YARN_INSTALL_LAMBDA_MEMORY_MB,
            Timeout: YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
          },
        });
      }

      if (command instanceof InvokeCommand) {
        return Promise.resolve(invokeResult);
      }

      return Promise.resolve({});
    });
  };

  beforeEach(() => {
    lambdaClientSend = jest.fn();
    const awsClient = {
      getLambdaClient: jest.fn().mockResolvedValue({ send: lambdaClientSend }),
    } as unknown as LambdaAwsClientService;

    service = new LambdaToolFunctionsService(
      { lambdaRole: 'role', resourceNamespace: 'ns' },
      awsClient,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('runYarnInstallCreateLayer', () => {
    const params = {
      packageJson: '{}',
      yarnLock: '',
      presignedUploadUrl: 'https://example.com/upload',
      maxUnzippedSizeMb: 200,
    };

    it('should return the parsed result when the Lambda succeeds', async () => {
      setupInvokeResult(buildInvokeResult({ success: true }));

      await expect(service.runYarnInstallCreateLayer(params)).resolves.toEqual({
        success: true,
      });
    });

    it('should map a dependencies size error to LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED with the original message', async () => {
      const errorMessage =
        'Dependencies size exceeded: production dependencies unpack to 292MB, the maximum is 200MB.';

      setupInvokeResult(
        buildInvokeResult({ errorType: 'Error', errorMessage }, 'Unhandled'),
      );

      await expect(service.runYarnInstallCreateLayer(params)).rejects.toThrow(
        expect.objectContaining({
          code: LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
          message: errorMessage,
        }),
      );
    });

    it('should map an out-of-memory kill to LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED', async () => {
      setupInvokeResult(
        buildInvokeResult(
          {
            errorType: 'Runtime.OutOfMemory',
            errorMessage: 'Error: Runtime exited with error: signal: killed',
          },
          'Unhandled',
        ),
      );

      await expect(service.runYarnInstallCreateLayer(params)).rejects.toThrow(
        expect.objectContaining({
          code: LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
        }),
      );
    });

    it('should map any other Lambda failure to LOGIC_FUNCTION_CREATE_FAILED', async () => {
      setupInvokeResult(
        buildInvokeResult(
          { errorType: 'Error', errorMessage: 'yarn install failed: ENETDOWN' },
          'Unhandled',
        ),
      );

      await expect(service.runYarnInstallCreateLayer(params)).rejects.toThrow(
        expect.objectContaining({
          code: LogicFunctionExceptionCode.LOGIC_FUNCTION_CREATE_FAILED,
        }),
      );
    });

    it('should throw when the Lambda does not report success', async () => {
      setupInvokeResult(buildInvokeResult({}));

      await expect(service.runYarnInstallCreateLayer(params)).rejects.toThrow(
        'Yarn install Lambda did not report success',
      );
    });
  });

  describe('tool function configuration reconciliation', () => {
    it('should not update the configuration when memory and timeout already match', async () => {
      setupInvokeResult(buildInvokeResult({ success: true }));

      await service.runYarnInstallCreateLayer({
        packageJson: '{}',
        yarnLock: '',
        presignedUploadUrl: 'https://example.com/upload',
        maxUnzippedSizeMb: 200,
      });

      const commandNames = lambdaClientSend.mock.calls.map(
        ([command]) => command.constructor.name,
      );

      expect(commandNames).not.toContain('UpdateFunctionConfigurationCommand');
    });

    it('should update the configuration when the deployed memory drifted', async () => {
      const waitFunctionUpdated = jest.fn();
      const awsClient = {
        getLambdaClient: jest
          .fn()
          .mockResolvedValue({ send: lambdaClientSend }),
        waitFunctionUpdated,
      } as unknown as LambdaAwsClientService;

      service = new LambdaToolFunctionsService(
        { lambdaRole: 'role', resourceNamespace: 'ns' },
        awsClient,
      );

      lambdaClientSend.mockImplementation((command) => {
        if (command instanceof GetFunctionCommand) {
          return Promise.resolve({
            Configuration: { MemorySize: 1024, Timeout: 300 },
          });
        }

        if (command instanceof InvokeCommand) {
          return Promise.resolve(buildInvokeResult({ success: true }));
        }

        return Promise.resolve({});
      });

      await service.runYarnInstallCreateLayer({
        packageJson: '{}',
        yarnLock: '',
        presignedUploadUrl: 'https://example.com/upload',
        maxUnzippedSizeMb: 200,
      });

      const commandNames = lambdaClientSend.mock.calls.map(
        ([command]) => command.constructor.name,
      );

      expect(commandNames).toContain('UpdateFunctionConfigurationCommand');
      expect(waitFunctionUpdated).toHaveBeenCalled();
    });
  });
});
