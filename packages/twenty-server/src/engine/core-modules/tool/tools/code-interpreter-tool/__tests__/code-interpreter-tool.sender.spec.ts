import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { CodeInterpreterTool } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/code-interpreter-tool';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

describe('Code interpreter sender credentials', () => {
  it.each([undefined, 'application'])(
    'preserves application scope %s in the sandbox token and session identity',
    async (applicationId) => {
      const interpreter = {
        execute: jest
          .fn()
          .mockResolvedValue({
            exitCode: 0,
            stdout: '',
            stderr: '',
            files: [],
          }),
      };
      const jwt = {
        signAsyncOrThrow: jest.fn().mockResolvedValue('scoped-token'),
      };
      const tool = new CodeInterpreterTool(
        interpreter as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        { get: () => 'http://localhost:3000' } as never,
        jwt as never,
      );
      await withWorkspaceAuthContext(
        {
          type: 'user',
          workspace: { id: 'workspace' },
          userWorkspaceId: 'sender',
          application: applicationId ? { id: applicationId } : undefined,
        } as never,
        () =>
          tool.execute(
            { code: "print('hello')" },
            {
              workspaceId: 'workspace',
              userId: 'user',
              userWorkspaceId: 'sender',
              threadId: 'thread',
            },
          ),
      );
      expect(jwt.signAsyncOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({
          type: applicationId
            ? JwtTokenTypeEnum.APPLICATION_ACCESS
            : JwtTokenTypeEnum.ACCESS,
          userWorkspaceId: 'sender',
          userId: 'user',
          workspaceId: 'workspace',
          ...(applicationId
            ? { applicationId, sub: applicationId }
            : { sub: 'user' }),
        }),
        { expiresIn: '5m' },
      );
      expect(interpreter.execute).toHaveBeenCalledWith(
        expect.any(String),
        [],
        expect.objectContaining({
          sessionId: 'workspace:thread',
          actorKey: `sender:${applicationId ?? 'direct'}`,
          env: expect.objectContaining({ TWENTY_API_TOKEN: 'scoped-token' }),
        }),
        expect.any(Object),
      );
    },
  );
});
