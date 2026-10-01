import { type ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { ApplicationTargetArgs } from 'src/engine/decorators/auth/application-target-args.decorator';
import { ApplicationRegistrationOwnershipGuard } from 'src/engine/guards/application-registration-ownership.guard';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-uid';
const LINKED_REGISTRATION_ID = 'linked-registration-id';
const LOGIC_FUNCTION_ID = 'logic-function-id';

const LINKED_APPLICATION = {
  id: APPLICATION_ID,
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  applicationRegistrationId: LINKED_REGISTRATION_ID,
};

const UNLINKED_APPLICATION = {
  ...LINKED_APPLICATION,
  applicationRegistrationId: null,
};

type UploadInput = { applicationUniversalIdentifier: string };

type LogicFunctionInput = { id: string };

class TestResolver {
  ownedUpload(
    @ApplicationTargetArgs<UploadInput>({
      kind: 'applicationUniversalIdentifier',
      idKey: 'applicationUniversalIdentifier',
      requireApplicationRegistrationOwnership: true,
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

  updateRegistration(
    @ApplicationTargetArg('id', {
      kind: 'applicationRegistrationId',
      requireApplicationRegistrationOwnership: true,
    })
    _id: string,
  ) {}

  updateApplication(
    @ApplicationTargetArg('applicationId', {
      kind: 'applicationId',
      requireApplicationRegistrationOwnership: true,
    })
    _applicationId: string,
  ) {}

  updateLogicFunction(
    @ApplicationTargetArg<LogicFunctionInput>('input', {
      kind: 'applicationOwnedEntity',
      metadataName: 'logicFunction',
      idKey: 'id',
      requireApplicationRegistrationOwnership: true,
    })
    _input: LogicFunctionInput,
  ) {}
}

const buildFlatLogicFunctionMaps = () => ({
  byUniversalIdentifier: {
    'logic-function': {
      id: LOGIC_FUNCTION_ID,
      universalIdentifier: 'logic-function',
      applicationId: APPLICATION_ID,
    },
  },
  universalIdentifierById: {
    [LOGIC_FUNCTION_ID]: 'logic-function',
  },
  universalIdentifiersByApplicationId: {},
});

describe('ApplicationRegistrationOwnershipGuard', () => {
  let guard: ApplicationRegistrationOwnershipGuard;

  const applicationService = {
    findByUniversalIdentifier: jest.fn(),
    findById: jest.fn(),
  };

  const applicationRegistrationService = {
    findOneOwnedByWorkspaceOrThrow: jest.fn(),
    findOneByIdOwnedByWorkspaceOrThrow: jest.fn(),
  };

  const buildContext = ({
    handler,
    args,
    workspace = { id: WORKSPACE_ID },
  }: {
    handler: (...args: never[]) => unknown;
    args: Record<string, unknown>;
    workspace?: { id: string } | null;
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

  const expectNoOwnershipCheck = () => {
    expect(
      applicationRegistrationService.findOneOwnedByWorkspaceOrThrow,
    ).not.toHaveBeenCalled();
    expect(
      applicationRegistrationService.findOneByIdOwnedByWorkspaceOrThrow,
    ).not.toHaveBeenCalled();
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    applicationService.findByUniversalIdentifier.mockResolvedValue(
      LINKED_APPLICATION,
    );
    applicationService.findById.mockResolvedValue(LINKED_APPLICATION);

    guard = new ApplicationRegistrationOwnershipGuard(
      new Reflector(),
      applicationService as unknown as ApplicationService,
      applicationRegistrationService as unknown as ApplicationRegistrationService,
      {
        getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
          flatLogicFunctionMaps: buildFlatLogicFunctionMaps(),
        }),
      } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService,
    );
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

  it('should skip the check when the handler does not require ownership', async () => {
    const context = buildContext({
      handler: TestResolver.prototype.nonOwnershipUpload,
      args: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expectNoOwnershipCheck();
  });

  it('should refuse when the workspace is missing from the request', async () => {
    const context = buildContext({
      handler: TestResolver.prototype.ownedUpload,
      args: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      },
      workspace: null,
    });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: ApplicationExceptionCode.FORBIDDEN,
    });
    expectNoOwnershipCheck();
  });

  it('should refuse when the target identifier is missing', async () => {
    const context = buildContext({
      handler: TestResolver.prototype.ownedUpload,
      args: {},
    });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: ApplicationExceptionCode.FORBIDDEN,
    });
    expectNoOwnershipCheck();
  });

  it('should propagate a refusal from the ownership rule', async () => {
    applicationRegistrationService.findOneByIdOwnedByWorkspaceOrThrow.mockRejectedValueOnce(
      new ApplicationException('Refused', ApplicationExceptionCode.FORBIDDEN),
    );

    const context = buildContext({
      handler: TestResolver.prototype.ownedUpload,
      args: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      },
    });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: ApplicationExceptionCode.FORBIDDEN,
    });
  });

  describe('applicationUniversalIdentifier', () => {
    it('should check the registration the application row links to', async () => {
      const context = buildContext({
        handler: TestResolver.prototype.ownedUpload,
        args: {
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      });

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(applicationService.findByUniversalIdentifier).toHaveBeenCalledWith(
        {
          universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          workspaceId: WORKSPACE_ID,
        },
      );
      expect(
        applicationRegistrationService.findOneByIdOwnedByWorkspaceOrThrow,
      ).toHaveBeenCalledWith({
        applicationRegistrationId: LINKED_REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
      });
      expect(
        applicationRegistrationService.findOneOwnedByWorkspaceOrThrow,
      ).not.toHaveBeenCalled();
    });

    it.each([
      { title: 'is not linked', application: UNLINKED_APPLICATION },
      { title: 'does not exist in the workspace', application: null },
    ])(
      'should fall back to the identifier when the application row $title',
      async ({ application }) => {
        applicationService.findByUniversalIdentifier.mockResolvedValueOnce(
          application,
        );

        const context = buildContext({
          handler: TestResolver.prototype.ownedUpload,
          args: {
            applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          },
        });

        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(
          applicationRegistrationService.findOneOwnedByWorkspaceOrThrow,
        ).toHaveBeenCalledWith({
          universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          workspaceId: WORKSPACE_ID,
        });
        expect(
          applicationRegistrationService.findOneByIdOwnedByWorkspaceOrThrow,
        ).not.toHaveBeenCalled();
      },
    );
  });

  describe('applicationRegistrationId', () => {
    it('should check the targeted registration', async () => {
      const context = buildContext({
        handler: TestResolver.prototype.updateRegistration,
        args: { id: 'targeted-registration-id' },
      });

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(
        applicationRegistrationService.findOneByIdOwnedByWorkspaceOrThrow,
      ).toHaveBeenCalledWith({
        applicationRegistrationId: 'targeted-registration-id',
        workspaceId: WORKSPACE_ID,
      });
    });
  });

  describe('applicationId', () => {
    it('should check the registration the targeted application links to', async () => {
      const context = buildContext({
        handler: TestResolver.prototype.updateApplication,
        args: { applicationId: APPLICATION_ID },
      });

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(applicationService.findById).toHaveBeenCalledWith({
        id: APPLICATION_ID,
        workspaceId: WORKSPACE_ID,
      });
      expect(
        applicationRegistrationService.findOneByIdOwnedByWorkspaceOrThrow,
      ).toHaveBeenCalledWith({
        applicationRegistrationId: LINKED_REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
      });
    });

    it('should fall back to the identifier when the application is not linked', async () => {
      applicationService.findById.mockResolvedValueOnce(UNLINKED_APPLICATION);

      const context = buildContext({
        handler: TestResolver.prototype.updateApplication,
        args: { applicationId: APPLICATION_ID },
      });

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(
        applicationRegistrationService.findOneOwnedByWorkspaceOrThrow,
      ).toHaveBeenCalledWith({
        universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        workspaceId: WORKSPACE_ID,
      });
    });

    it('should refuse an application unknown to the workspace', async () => {
      applicationService.findById.mockResolvedValueOnce(null);

      const context = buildContext({
        handler: TestResolver.prototype.updateApplication,
        args: { applicationId: 'unknown-application-id' },
      });

      await expect(guard.canActivate(context)).rejects.toMatchObject({
        code: ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      });
      expectNoOwnershipCheck();
    });
  });

  describe('applicationOwnedEntity', () => {
    it('should check the registration of the application owning the entity', async () => {
      const context = buildContext({
        handler: TestResolver.prototype.updateLogicFunction,
        args: { input: { id: LOGIC_FUNCTION_ID } },
      });

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(applicationService.findById).toHaveBeenCalledWith({
        id: APPLICATION_ID,
        workspaceId: WORKSPACE_ID,
      });
      expect(
        applicationRegistrationService.findOneByIdOwnedByWorkspaceOrThrow,
      ).toHaveBeenCalledWith({
        applicationRegistrationId: LINKED_REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
      });
    });

    it('should refuse an entity unknown to the workspace', async () => {
      const context = buildContext({
        handler: TestResolver.prototype.updateLogicFunction,
        args: { input: { id: 'unknown-logic-function-id' } },
      });

      await expect(guard.canActivate(context)).rejects.toMatchObject({
        code: ApplicationExceptionCode.ENTITY_NOT_FOUND,
      });
      expect(applicationService.findById).not.toHaveBeenCalled();
      expectNoOwnershipCheck();
    });
  });
});
