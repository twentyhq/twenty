import {
  GetFunctionCommand,
  InvokeCommand,
  ResourceConflictException,
  UpdateFunctionConfigurationCommand,
} from '@aws-sdk/client-lambda';

import {
  DEPENDENCIES_SIZE_EXCEEDED_ERROR_NAME,
  LAMBDA_EPHEMERAL_STORAGE_MB,
  TOOL_FUNCTION_RECONCILE_MAX_ATTEMPTS,
  YARN_INSTALL_LAMBDA_MEMORY_MB,
  YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';

jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue('handler-content'),
}));

const MATCHING_CONFIGURATION = {
  MemorySize: YARN_INSTALL_LAMBDA_MEMORY_MB,
  Timeout: YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
  EphemeralStorage: { Size: LAMBDA_EPHEMERAL_STORAGE_MB },
  State: 'Active',
  LastUpdateStatus: 'Successful',
};

const DRIFTED_CONFIGURATION = {
  ...MATCHING_CONFIGURATION,
  MemorySize: 1024,
};

const buildInvokeResult = (payload: object, functionError?: string) => ({
  FunctionError: functionError,
  Payload: {
    transformToString: () => JSON.stringify(payload),
  },
});

const params = {
  packageJson: '{}',
  yarnLock: '',
  presignedUploadUrl: 'https://example.com/upload',
  maxUnzippedSizeMb: 200,
};

describe('LambdaToolFunctionsService', () => {
  let lambdaClientSend: jest.Mock;
  let waitFunctionUpdated: jest.Mock;
  let service: LambdaToolFunctionsService;

  const setupInvokeResult = (invokeResult: object) => {
    lambdaClientSend.mockImplementation((command) => {
      if (command instanceof GetFunctionCommand) {
        return Promise.resolve({ Configuration: MATCHING_CONFIGURATION });
      }

      if (command instanceof InvokeCommand) {
        return Promise.resolve(invokeResult);
      }

      return Promise.resolve({});
    });
  };

  beforeEach(() => {
    lambdaClientSend = jest.fn();
    waitFunctionUpdated = jest.fn();
    const awsClient = {
      getLambdaClient: jest.fn().mockResolvedValue({ send: lambdaClientSend }),
      waitFunctionActive: jest.fn(),
      waitFunctionUpdated,
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
    it('should return the parsed result when the Lambda succeeds', async () => {
      setupInvokeResult(buildInvokeResult({ success: true }));

      await expect(service.runYarnInstallCreateLayer(params)).resolves.toEqual({
        success: true,
      });
    });

    it('should map the dependencies size error type to LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED with the original message', async () => {
      const errorMessage =
        'Dependencies size exceeded: production dependencies unpack to 292MB, the maximum is 200MB.';

      setupInvokeResult(
        buildInvokeResult(
          { errorType: DEPENDENCIES_SIZE_EXCEEDED_ERROR_NAME, errorMessage },
          'Unhandled',
        ),
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
    const countCommands = (commandName: string) =>
      lambdaClientSend.mock.calls.filter(
        ([command]) => command.constructor.name === commandName,
      ).length;

    const setupReconcileScenario = ({
      onUpdate,
      convergesAfterUpdate = true,
    }: {
      onUpdate?: () => void;
      convergesAfterUpdate?: boolean;
    }) => {
      let updateAttempted = false;

      lambdaClientSend.mockImplementation((command) => {
        if (command instanceof GetFunctionCommand) {
          return Promise.resolve({
            Configuration:
              updateAttempted && convergesAfterUpdate
                ? MATCHING_CONFIGURATION
                : DRIFTED_CONFIGURATION,
          });
        }

        if (command instanceof UpdateFunctionConfigurationCommand) {
          updateAttempted = true;
          onUpdate?.();

          return Promise.resolve({});
        }

        if (command instanceof InvokeCommand) {
          return Promise.resolve(buildInvokeResult({ success: true }));
        }

        return Promise.resolve({});
      });
    };

    it('should not update the configuration when it already matches', async () => {
      setupInvokeResult(buildInvokeResult({ success: true }));

      await service.runYarnInstallCreateLayer(params);

      expect(countCommands('UpdateFunctionConfigurationCommand')).toBe(0);
    });

    it('should update the configuration and verify convergence when it drifted', async () => {
      setupReconcileScenario({});

      await service.runYarnInstallCreateLayer(params);

      expect(countCommands('UpdateFunctionConfigurationCommand')).toBe(1);
      expect(waitFunctionUpdated).toHaveBeenCalled();
    });

    it('should tolerate a concurrent update conflict and succeed once the configuration converges', async () => {
      setupReconcileScenario({
        onUpdate: () => {
          throw new ResourceConflictException({
            message: 'update in progress',
            $metadata: {},
          });
        },
      });

      await expect(service.runYarnInstallCreateLayer(params)).resolves.toEqual({
        success: true,
      });
      expect(waitFunctionUpdated).toHaveBeenCalled();
    });

    it('should fail loudly when the configuration never converges', async () => {
      setupReconcileScenario({ convergesAfterUpdate: false });

      await expect(service.runYarnInstallCreateLayer(params)).rejects.toThrow(
        'could not be reconciled',
      );
      expect(countCommands('UpdateFunctionConfigurationCommand')).toBe(
        TOOL_FUNCTION_RECONCILE_MAX_ATTEMPTS,
      );
    });
  });
});
