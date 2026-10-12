import { Test } from '@nestjs/testing';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { CodeInterpreterTool } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/code-interpreter-tool';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const SERVER_URL = 'http://localhost:3000';
const WORKSPACE_ID = 'workspace-id';
const USER_ID = 'user-id';
const USER_WORKSPACE_ID = 'user-workspace-id';
const CALLING_APPLICATION_ID = 'calling-application-id';
const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application-id';

const SESSION_TOKEN_TYPES = [
  JwtTokenTypeEnum.ACCESS,
  JwtTokenTypeEnum.PLAYGROUND,
  JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
];

const buildUserContext = (
  applicationFields: Record<string, unknown> = {},
): WorkspaceAuthContext =>
  ({
    type: 'user',
    workspace: { id: WORKSPACE_ID },
    user: { id: USER_ID },
    userWorkspaceId: USER_WORKSPACE_ID,
    workspaceMemberId: 'workspace-member-id',
    ...applicationFields,
  }) as WorkspaceAuthContext;

const runInterpreter = async (authContext?: WorkspaceAuthContext) => {
  const codeInterpreterService = {
    execute: jest.fn().mockResolvedValue({
      exitCode: 0,
      stdout: '',
      stderr: '',
      files: [],
    }),
  };
  const jwtWrapperService = {
    signAsyncOrThrow: jest.fn().mockResolvedValue('sandbox-token'),
  };

  const module = await Test.createTestingModule({
    providers: [
      CodeInterpreterTool,
      { provide: CodeInterpreterService, useValue: codeInterpreterService },
      { provide: FileStorageService, useValue: {} },
      { provide: FileService, useValue: {} },
      { provide: FileUrlService, useValue: {} },
      { provide: SecureHttpClientService, useValue: {} },
      { provide: TwentyConfigService, useValue: { get: () => SERVER_URL } },
      { provide: JwtWrapperService, useValue: jwtWrapperService },
      {
        provide: ApplicationService,
        useValue: {
          findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
            .fn()
            .mockResolvedValue({
              workspaceCustomFlatApplication: {
                id: WORKSPACE_CUSTOM_APPLICATION_ID,
              },
            }),
        },
      },
      {
        provide: ApplicationTokenService,
        useValue: new ApplicationTokenService(
          jwtWrapperService as never,
          {
            findOne: jest.fn().mockResolvedValue({ id: WORKSPACE_ID }),
          } as never,
          {
            findOne: jest.fn(
              async (
                _workspaceId: string,
                { where }: { where: { id: string } },
              ) => ({ id: where.id }),
            ),
          } as never,
          { get: jest.fn().mockReturnValue('30m') } as never,
        ),
      },
    ],
  }).compile();

  const tool = module.get(CodeInterpreterTool);

  const execute = () =>
    tool.execute(
      { code: "print('hello')" },
      {
        workspaceId: WORKSPACE_ID,
        userId: USER_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        threadId: 'thread',
      },
    );

  const output = isDefined(authContext)
    ? await withWorkspaceAuthContext(authContext, execute)
    : await execute();

  expect(output.success).toBe(true);

  const signedPayloads = jwtWrapperService.signAsyncOrThrow.mock.calls.map(
    ([payload]) => payload,
  );

  for (const payload of signedPayloads) {
    expect(SESSION_TOKEN_TYPES).not.toContain(payload.type);
  }

  return {
    signAsyncOrThrow: jwtWrapperService.signAsyncOrThrow,
    sandboxContext: codeInterpreterService.execute.mock.calls[0][2],
  };
};

describe('Code interpreter sandbox token', () => {
  it.each([
    [
      'an application driving the chat for the person',
      buildUserContext({ application: { id: CALLING_APPLICATION_ID } }),
      CALLING_APPLICATION_ID,
    ],
    [
      'an application running its agent as the person',
      buildUserContext({ viaApplication: { id: CALLING_APPLICATION_ID } }),
      CALLING_APPLICATION_ID,
    ],
    [
      'the person with no application, through the workspace custom application',
      buildUserContext(),
      WORKSPACE_CUSTOM_APPLICATION_ID,
    ],
  ])(
    'signs a 5-minute application token bound to the person for %s',
    async (_, authContext, expectedApplicationId) => {
      const { signAsyncOrThrow, sandboxContext } =
        await runInterpreter(authContext);

      expect(signAsyncOrThrow).toHaveBeenCalledTimes(1);
      expect(signAsyncOrThrow).toHaveBeenCalledWith(
        {
          sub: expectedApplicationId,
          type: JwtTokenTypeEnum.APPLICATION_ACCESS,
          workspaceId: WORKSPACE_ID,
          applicationId: expectedApplicationId,
          userId: USER_ID,
          userWorkspaceId: USER_WORKSPACE_ID,
        },
        { expiresIn: '5m' },
      );
      expect(sandboxContext).toEqual({
        sessionId: `${WORKSPACE_ID}:thread`,
        actorKey: `${USER_WORKSPACE_ID}:${expectedApplicationId}`,
        env: {
          TWENTY_SERVER_URL: SERVER_URL,
          TWENTY_API_TOKEN: 'sandbox-token',
        },
      });
    },
  );

  it('signs a 5-minute application token bound to nobody for an application running on its own', async () => {
    const { signAsyncOrThrow, sandboxContext } = await runInterpreter({
      type: 'application',
      workspace: { id: WORKSPACE_ID },
      application: { id: CALLING_APPLICATION_ID },
    } as WorkspaceAuthContext);

    expect(signAsyncOrThrow).toHaveBeenCalledTimes(1);
    expect(signAsyncOrThrow).toHaveBeenCalledWith(
      {
        sub: CALLING_APPLICATION_ID,
        type: JwtTokenTypeEnum.APPLICATION_ACCESS,
        workspaceId: WORKSPACE_ID,
        applicationId: CALLING_APPLICATION_ID,
      },
      { expiresIn: '5m' },
    );
    expect(sandboxContext.env).toEqual({
      TWENTY_SERVER_URL: SERVER_URL,
      TWENTY_API_TOKEN: 'sandbox-token',
    });
  });

  it.each([
    [
      'an API key',
      {
        type: 'apiKey',
        workspace: { id: WORKSPACE_ID },
        apiKey: { id: 'api-key-id' },
      } as WorkspaceAuthContext,
    ],
    [
      'the system',
      {
        type: 'system',
        workspace: { id: WORKSPACE_ID },
      } as WorkspaceAuthContext,
    ],
    ['no auth context', undefined],
  ])('hands the sandbox no token for %s', async (_, authContext) => {
    const { signAsyncOrThrow, sandboxContext } =
      await runInterpreter(authContext);

    expect(signAsyncOrThrow).not.toHaveBeenCalled();
    expect(sandboxContext.env).toEqual({ TWENTY_SERVER_URL: SERVER_URL });
  });

  it('never shares a sandbox between the person running it directly and an application acting for them', async () => {
    const { sandboxContext: directRun } =
      await runInterpreter(buildUserContext());
    const { sandboxContext: applicationRun } = await runInterpreter(
      buildUserContext({ viaApplication: { id: CALLING_APPLICATION_ID } }),
    );

    expect(directRun.sessionId).toBe(applicationRun.sessionId);
    expect(directRun.actorKey).not.toBe(applicationRun.actorKey);
  });
});
