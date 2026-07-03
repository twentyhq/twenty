import {
  DeleteFunctionCommand,
  GetFunctionCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-lambda';

import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';

const LAMBDA_ROLE = 'arn:aws:iam::111111111111:role/lambda-execution';
const FUNCTION_NAME = 'twenty-builder-abc123-1de57afd1177';

// Exercises the role-heal branch that guards against a shared function created
// by another instance whose execution role was since deleted. Naming utils are
// covered separately; this locks in "delete only on role mismatch, never on
// match" so the heal can never nuke a healthy function.
describe('LambdaToolFunctionsService.toolFunctionExistsWithExpectedRole', () => {
  const buildService = (send: jest.Mock) => {
    const waitFunctionDeleted = jest.fn().mockResolvedValue(undefined);
    const awsClient = {
      getLambdaClient: jest.fn().mockResolvedValue({ send }),
      waitFunctionDeleted,
    } as unknown as LambdaAwsClientService;

    const service = new LambdaToolFunctionsService(
      { lambdaRole: LAMBDA_ROLE, resourceNamespace: 'abc123' },
      awsClient,
    );

    // toolFunctionExistsWithExpectedRole is private; call it directly to keep
    // the assertions on the heal logic rather than the whole create pipeline.
    const call = (name: string): Promise<boolean> =>
      (
        service as unknown as {
          toolFunctionExistsWithExpectedRole: (n: string) => Promise<boolean>;
        }
      ).toolFunctionExistsWithExpectedRole(name);

    return { call, send, waitFunctionDeleted };
  };

  it('returns true and deletes nothing when the role matches', async () => {
    const send = jest
      .fn()
      .mockResolvedValue({ Configuration: { Role: LAMBDA_ROLE } });

    const { call, waitFunctionDeleted } = buildService(send);

    const result = await call(FUNCTION_NAME);

    expect(result).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toBeInstanceOf(GetFunctionCommand);
    expect(waitFunctionDeleted).not.toHaveBeenCalled();
  });

  it('deletes and returns false when the role does not match', async () => {
    const send = jest.fn().mockImplementation((command) => {
      if (command instanceof GetFunctionCommand) {
        return Promise.resolve({
          Configuration: {
            Role: 'arn:aws:iam::999999999999:role/stale-deleted-role',
          },
        });
      }

      return Promise.resolve({});
    });

    const { call, waitFunctionDeleted } = buildService(send);

    const result = await call(FUNCTION_NAME);

    expect(result).toBe(false);

    const deleteCommand = send.mock.calls
      .map((args) => args[0])
      .find((command) => command instanceof DeleteFunctionCommand);

    expect(deleteCommand).toBeInstanceOf(DeleteFunctionCommand);
    expect(deleteCommand.input.FunctionName).toBe(FUNCTION_NAME);
    expect(waitFunctionDeleted).toHaveBeenCalledWith(FUNCTION_NAME);
  });

  it('returns false without deleting when the function does not exist', async () => {
    const send = jest
      .fn()
      .mockRejectedValue(
        new ResourceNotFoundException({ message: 'not found', $metadata: {} }),
      );

    const { call, waitFunctionDeleted } = buildService(send);

    const result = await call(FUNCTION_NAME);

    expect(result).toBe(false);
    expect(send).toHaveBeenCalledTimes(1);
    expect(waitFunctionDeleted).not.toHaveBeenCalled();
  });
});
