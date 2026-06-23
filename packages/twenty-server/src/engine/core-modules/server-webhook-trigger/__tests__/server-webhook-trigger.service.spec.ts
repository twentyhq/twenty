import { type Request } from 'express';
import { type Repository } from 'typeorm';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
  type LogicFunctionExecutorService,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { ServerWebhookTriggerExceptionCode } from 'src/engine/core-modules/server-webhook-trigger/exceptions/server-webhook-trigger.exception';
import { ServerWebhookTriggerService } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const RESOLVER_UID = 'resolver-uid';
const TARGET_UID = 'target-uid';

const buildExecuteResult = (
  data: object | null,
  error?: { errorMessage: string },
): LogicFunctionExecuteResult => ({
  data,
  duration: 1,
  logs: '',
  status: error
    ? LogicFunctionExecutionStatus.ERROR
    : LogicFunctionExecutionStatus.SUCCESS,
  ...(error
    ? {
        error: {
          errorType: 'Error',
          errorMessage: error.errorMessage,
          stackTrace: '',
        },
      }
    : {}),
});

const buildRequest = (body: object | null = {}): Request =>
  ({
    method: 'POST',
    path: `/webhooks/server/${RESOLVER_UID}/${TARGET_UID}`,
    query: {},
    headers: {},
    rawBody: Buffer.from(JSON.stringify(body ?? {}), 'utf-8'),
    body,
  }) as unknown as Request;

describe('ServerWebhookTriggerService', () => {
  let service: ServerWebhookTriggerService;
  let applicationRegistrationRepository: jest.Mocked<
    Pick<Repository<ApplicationRegistrationEntity>, 'find'>
  >;
  let logicFunctionExecutorService: jest.Mocked<
    Pick<LogicFunctionExecutorService, 'execute'>
  >;
  let workspaceCacheService: jest.Mocked<
    Pick<WorkspaceCacheService, 'getOrRecompute'>
  >;
  let twentyConfigService: jest.Mocked<Pick<TwentyConfigService, 'get'>>;

  const handle = () =>
    service.handle({
      request: buildRequest(),
      resolverLogicFunctionUniversalIdentifier: RESOLVER_UID,
      targetLogicFunctionUniversalIdentifier: TARGET_UID,
    });

  // Each workspace's cache holds only its own logic functions. The resolver
  // lives in `owner-ws` (a registration owner); the target lives in
  // `target-ws` (resolved at runtime).
  const buildWorkspaceCacheMock = ({
    ownerWorkspaceId = 'owner-ws',
    targetWorkspaceId = 'target-ws',
    ownerHasResolver = true,
    targetHasTarget = true,
  }: {
    ownerWorkspaceId?: string;
    targetWorkspaceId?: string;
    ownerHasResolver?: boolean;
    targetHasTarget?: boolean;
  } = {}) =>
    jest.fn().mockImplementation(async (workspaceId: string) => {
      if (workspaceId === ownerWorkspaceId && ownerHasResolver) {
        return {
          flatLogicFunctionMaps: {
            byUniversalIdentifier: {
              'resolver-id': {
                id: 'resolver-id',
                universalIdentifier: RESOLVER_UID,
                deletedAt: null,
                serverWebhookTriggerSettings: {
                  forwardedRequestHeaders: ['x-test'],
                },
              },
            },
          },
        };
      }

      if (workspaceId === targetWorkspaceId && targetHasTarget) {
        return {
          flatLogicFunctionMaps: {
            byUniversalIdentifier: {
              'target-id': {
                id: 'target-id',
                universalIdentifier: TARGET_UID,
                deletedAt: null,
              },
            },
          },
        };
      }

      return { flatLogicFunctionMaps: { byUniversalIdentifier: {} } };
    });

  beforeEach(() => {
    applicationRegistrationRepository = {
      find: jest.fn().mockResolvedValue([{ ownerWorkspaceId: 'owner-ws' }]),
    };
    logicFunctionExecutorService = {
      execute: jest
        .fn()
        // resolver returns { workspaceId, payload }
        .mockResolvedValueOnce(
          buildExecuteResult({
            workspaceId: 'target-ws',
            payload: { from: 'resolver' },
          }),
        )
        // target returns the final response body
        .mockResolvedValueOnce(buildExecuteResult({ ok: true })),
    };
    workspaceCacheService = {
      getOrRecompute: buildWorkspaceCacheMock(),
    };
    twentyConfigService = { get: jest.fn().mockReturnValue(true) };

    service = new ServerWebhookTriggerService(
      applicationRegistrationRepository as unknown as Repository<ApplicationRegistrationEntity>,
      logicFunctionExecutorService as unknown as LogicFunctionExecutorService,
      workspaceCacheService as unknown as WorkspaceCacheService,
      twentyConfigService as unknown as TwentyConfigService,
    );
  });

  it('runs the resolver in the owner workspace then the target in the resolved workspace', async () => {
    const result = await handle();

    expect(logicFunctionExecutorService.execute).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        logicFunctionId: 'resolver-id',
        workspaceId: 'owner-ws',
      }),
    );
    expect(logicFunctionExecutorService.execute).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        logicFunctionId: 'target-id',
        workspaceId: 'target-ws',
        payload: { from: 'resolver' },
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        statusCode: 200,
        body: { ok: true },
      }),
    );
  });

  it('refuses when the feature is disabled', async () => {
    twentyConfigService.get.mockReturnValue(false);

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.FEATURE_DISABLED,
    });
  });

  it('throws LOGIC_FUNCTION_NOT_FOUND when no owner workspace has the resolver', async () => {
    workspaceCacheService.getOrRecompute = buildWorkspaceCacheMock({
      ownerHasResolver: false,
    });

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('throws LOGIC_FUNCTION_NOT_FOUND when no application registrations exist', async () => {
    applicationRegistrationRepository.find.mockResolvedValue([]);

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('throws RESOLVER_INVALID_RESULT when the resolver does not return a workspaceId', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockResolvedValueOnce(
      buildExecuteResult({ not_a_workspace: true }),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.RESOLVER_INVALID_RESULT,
    });
  });

  it('throws USER_UNCAUGHT_ERROR when the resolver returns an error', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockResolvedValueOnce(
      buildExecuteResult(null, { errorMessage: 'boom' }),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR,
    });
  });

  it('throws LOGIC_FUNCTION_NOT_FOUND when the target is missing in the resolved workspace', async () => {
    workspaceCacheService.getOrRecompute = buildWorkspaceCacheMock({
      targetHasTarget: false,
    });

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('surfaces a target userError as a webhook exception', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute
      .mockResolvedValueOnce(buildExecuteResult({ workspaceId: 'target-ws' }))
      .mockResolvedValueOnce(
        buildExecuteResult(null, { errorMessage: 'boom' }),
      );

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR,
    });
  });

  it('maps a LogicFunctionExecutionException(LOGIC_FUNCTION_NOT_FOUND) to the webhook not-found code', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockRejectedValue(
      new LogicFunctionExecutionException(
        'not found',
        LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      ),
    );

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });
  });

  it('falls back to PLATFORM_ERROR for any other thrown executor error', async () => {
    logicFunctionExecutorService.execute.mockReset();
    logicFunctionExecutorService.execute.mockRejectedValue(new Error('boom'));

    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_PLATFORM_ERROR,
    });
  });

  it('deduplicates owner workspaceIds returned by the registration query', async () => {
    applicationRegistrationRepository.find.mockResolvedValue([
      { ownerWorkspaceId: 'owner-ws' },
      { ownerWorkspaceId: 'owner-ws' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any);

    await handle();

    const calls = workspaceCacheService.getOrRecompute.mock.calls.filter(
      ([workspaceId]) => workspaceId === 'owner-ws',
    );

    expect(calls).toHaveLength(1);
  });
});
