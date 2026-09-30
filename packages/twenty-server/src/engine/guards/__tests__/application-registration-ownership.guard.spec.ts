import { type ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationTargetArgs } from 'src/engine/decorators/auth/application-target-args.decorator';
import { ApplicationRegistrationOwnershipGuard } from 'src/engine/guards/application-registration-ownership.guard';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-uid';

type UploadInput = { applicationUniversalIdentifier: string };

class TestResolver {
  ownedUpload(
    @ApplicationTargetArgs<UploadInput>({
      kind: 'applicationUniversalIdentifier',
      idKey: 'applicationUniversalIdentifier',
      requireWorkspaceOwnership: true,
    })
    _input: UploadInput,
  ) {}

  nonOwnershipUpload(
    @ApplicationTargetArgs<UploadInput>({
      kind: 'applicationUniversalIdentifier',
      idKey: 'applicationUniversalIdentifier',
    })
    _input: UploadInput,
  ) {}
}

describe('ApplicationRegistrationOwnershipGuard', () => {
  let guard: ApplicationRegistrationOwnershipGuard;
  let findOneOwnedByWorkspaceOrThrow: jest.Mock;

  const buildContext = ({
    handler,
    args,
    workspace,
  }: {
    handler: (...args: never[]) => unknown;
    args: Record<string, unknown>;
    workspace?: { id: string };
  }): ExecutionContext => {
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getArgs: () => args,
      getContext: () => ({ req: { workspace } }),
    } as unknown as GqlExecutionContext);

    return {
      getType: () => 'graphql',
      getHandler: () => handler,
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    jest.restoreAllMocks();

    findOneOwnedByWorkspaceOrThrow = jest.fn().mockResolvedValue({
      id: 'registration-id',
      ownerWorkspaceId: WORKSPACE_ID,
    });

    guard = new ApplicationRegistrationOwnershipGuard(new Reflector(), {
      findOneOwnedByWorkspaceOrThrow,
    } as unknown as ApplicationRegistrationService);
  });

  it('should attach the ownership guard only when ownership is required', () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, TestResolver.prototype.ownedUpload),
    ).toEqual([ApplicationTargetGuard, ApplicationRegistrationOwnershipGuard]);
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        TestResolver.prototype.nonOwnershipUpload,
      ),
    ).toEqual([ApplicationTargetGuard]);
  });

  it('should delegate to the shared ownership rule with the target identifier and workspace', async () => {
    const context = buildContext({
      handler: TestResolver.prototype.ownedUpload,
      args: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      },
      workspace: { id: WORKSPACE_ID },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(findOneOwnedByWorkspaceOrThrow).toHaveBeenCalledWith({
      universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      workspaceId: WORKSPACE_ID,
    });
  });

  it('should skip the check when the handler does not require ownership', async () => {
    const context = buildContext({
      handler: TestResolver.prototype.nonOwnershipUpload,
      args: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      },
      workspace: { id: WORKSPACE_ID },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(findOneOwnedByWorkspaceOrThrow).not.toHaveBeenCalled();
  });

  it('should refuse when the shared ownership rule rejects', async () => {
    findOneOwnedByWorkspaceOrThrow.mockRejectedValueOnce(
      new ApplicationException('Refused', ApplicationExceptionCode.FORBIDDEN),
    );

    const context = buildContext({
      handler: TestResolver.prototype.ownedUpload,
      args: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      },
      workspace: { id: WORKSPACE_ID },
    });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: ApplicationExceptionCode.FORBIDDEN,
    });
  });

  it('should refuse when the workspace is missing from the request', async () => {
    const context = buildContext({
      handler: TestResolver.prototype.ownedUpload,
      args: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      },
      workspace: undefined,
    });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: ApplicationExceptionCode.FORBIDDEN,
    });
    expect(findOneOwnedByWorkspaceOrThrow).not.toHaveBeenCalled();
  });

  it('should refuse when the target identifier is missing', async () => {
    const context = buildContext({
      handler: TestResolver.prototype.ownedUpload,
      args: {},
      workspace: { id: WORKSPACE_ID },
    });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: ApplicationExceptionCode.FORBIDDEN,
    });
    expect(findOneOwnedByWorkspaceOrThrow).not.toHaveBeenCalled();
  });
});
