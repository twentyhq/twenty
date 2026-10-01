import { type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { type ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { ApplicationTargetArgs } from 'src/engine/decorators/auth/application-target-args.decorator';
import { ApplicationRegistrationOwnershipGuard } from 'src/engine/guards/application-registration-ownership.guard';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = '4d2a8f6c-1b3e-4c95-a7d0-3e9f1b5c7a24';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'a8e3c1f5-6b2d-4a79-9c14-7f0d2e4b6a83';
const LINKED_REGISTRATION_ID = 'f1b7d3a9-2e4c-4d68-b0a5-9c3e7f1d5b26';
const LOGIC_FUNCTION_ID = '7c5e9a1d-3f8b-4e20-8a64-1d9b3f7e5c48';
const TARGETED_REGISTRATION_ID = 'b3d9f5c1-7a2e-4b84-9e36-5a1c7e3b9d60';
const FOREIGN_REGISTRATION_ID = '0e6a2c8f-4d1b-4f97-a3c5-8b2e6d0f4a19';
const UNKNOWN_APPLICATION_ID = '92c4e8b6-5f1a-4d3c-b7e9-6a0f2c8e4b75';
const UNKNOWN_LOGIC_FUNCTION_ID = '3a8f6d2b-9e4c-4a17-8d53-2f6b9a1e7c04';

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
      requireApplicationRegistrationOwnership: false,
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

  const applicationLookupService = {
    findByUniversalIdentifier: jest.fn(),
    findById: jest.fn(),
  };

  const applicationRegistrationLookupService = {
    findOneOwnedByWorkspaceOrThrow: jest.fn(),
    findOneByIdOwnedByWorkspaceOrThrow: jest.fn(),
    findOneByIdOrThrow: jest.fn(),
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
      applicationRegistrationLookupService.findOneOwnedByWorkspaceOrThrow,
    ).not.toHaveBeenCalled();
    expect(
      applicationRegistrationLookupService.findOneByIdOwnedByWorkspaceOrThrow,
    ).not.toHaveBeenCalled();
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    applicationLookupService.findByUniversalIdentifier.mockResolvedValue(
      LINKED_APPLICATION,
    );
    applicationLookupService.findById.mockResolvedValue(LINKED_APPLICATION);

    guard = new ApplicationRegistrationOwnershipGuard(
      new Reflector(),
      applicationLookupService as unknown as ApplicationLookupService,
      applicationRegistrationLookupService as unknown as ApplicationRegistrationLookupService,
      {
        getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
          flatLogicFunctionMaps: buildFlatLogicFunctionMaps(),
        }),
      } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService,
    );
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

  it.each([
    { title: 'missing', args: {} },
    { title: 'empty', args: { applicationUniversalIdentifier: '' } },
    {
      title: 'malformed',
      args: { applicationUniversalIdentifier: 'not-a-uuid' },
    },
  ])(
    'should refuse before any lookup when the target is $title',
    async ({ args }) => {
      const context = buildContext({
        handler: TestResolver.prototype.ownedUpload,
        args,
      });

      await expect(guard.canActivate(context)).rejects.toMatchObject({
        code: ApplicationExceptionCode.INVALID_INPUT,
      });
      expect(
        applicationLookupService.findByUniversalIdentifier,
      ).not.toHaveBeenCalled();
      expectNoOwnershipCheck();
    },
  );

  it('should propagate a refusal from the ownership rule', async () => {
    applicationRegistrationLookupService.findOneByIdOwnedByWorkspaceOrThrow.mockRejectedValueOnce(
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
      expect(
        applicationLookupService.findByUniversalIdentifier,
      ).toHaveBeenCalledWith({
        universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        workspaceId: WORKSPACE_ID,
      });
      expect(
        applicationRegistrationLookupService.findOneByIdOwnedByWorkspaceOrThrow,
      ).toHaveBeenCalledWith({
        applicationRegistrationId: LINKED_REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
      });
      expect(
        applicationRegistrationLookupService.findOneOwnedByWorkspaceOrThrow,
      ).not.toHaveBeenCalled();
    });

    it.each([
      { title: 'is not linked', application: UNLINKED_APPLICATION },
      { title: 'does not exist in the workspace', application: null },
    ])(
      'should fall back to the identifier when the application row $title',
      async ({ application }) => {
        applicationLookupService.findByUniversalIdentifier.mockResolvedValueOnce(
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
          applicationRegistrationLookupService.findOneOwnedByWorkspaceOrThrow,
        ).toHaveBeenCalledWith({
          universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          workspaceId: WORKSPACE_ID,
        });
        expect(
          applicationRegistrationLookupService.findOneByIdOwnedByWorkspaceOrThrow,
        ).not.toHaveBeenCalled();
      },
    );
  });

  describe('applicationRegistrationId', () => {
    it('should look the targeted registration up within the owner workspace', async () => {
      const context = buildContext({
        handler: TestResolver.prototype.updateRegistration,
        args: { id: TARGETED_REGISTRATION_ID },
      });

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(
        applicationRegistrationLookupService.findOneByIdOrThrow,
      ).toHaveBeenCalledWith({
        applicationRegistrationId: TARGETED_REGISTRATION_ID,
        ownerWorkspaceId: WORKSPACE_ID,
      });
      expect(
        applicationRegistrationLookupService.findOneByIdOwnedByWorkspaceOrThrow,
      ).not.toHaveBeenCalled();
    });

    it('should propagate the not found refusal for a registration the workspace does not own', async () => {
      applicationRegistrationLookupService.findOneByIdOrThrow.mockRejectedValueOnce(
        new ApplicationRegistrationException(
          `Application registration with id ${FOREIGN_REGISTRATION_ID} not found`,
          ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
        ),
      );

      const context = buildContext({
        handler: TestResolver.prototype.updateRegistration,
        args: { id: FOREIGN_REGISTRATION_ID },
      });

      await expect(guard.canActivate(context)).rejects.toMatchObject({
        code: ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
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
      expect(applicationLookupService.findById).toHaveBeenCalledWith({
        id: APPLICATION_ID,
        workspaceId: WORKSPACE_ID,
      });
      expect(
        applicationRegistrationLookupService.findOneByIdOwnedByWorkspaceOrThrow,
      ).toHaveBeenCalledWith({
        applicationRegistrationId: LINKED_REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
      });
    });

    it('should fall back to the identifier when the application is not linked', async () => {
      applicationLookupService.findById.mockResolvedValueOnce(
        UNLINKED_APPLICATION,
      );

      const context = buildContext({
        handler: TestResolver.prototype.updateApplication,
        args: { applicationId: APPLICATION_ID },
      });

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(
        applicationRegistrationLookupService.findOneOwnedByWorkspaceOrThrow,
      ).toHaveBeenCalledWith({
        universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        workspaceId: WORKSPACE_ID,
      });
    });

    it('should refuse an application unknown to the workspace', async () => {
      applicationLookupService.findById.mockResolvedValueOnce(null);

      const context = buildContext({
        handler: TestResolver.prototype.updateApplication,
        args: { applicationId: UNKNOWN_APPLICATION_ID },
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
      expect(applicationLookupService.findById).toHaveBeenCalledWith({
        id: APPLICATION_ID,
        workspaceId: WORKSPACE_ID,
      });
      expect(
        applicationRegistrationLookupService.findOneByIdOwnedByWorkspaceOrThrow,
      ).toHaveBeenCalledWith({
        applicationRegistrationId: LINKED_REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
      });
    });

    it('should refuse an entity unknown to the workspace', async () => {
      const context = buildContext({
        handler: TestResolver.prototype.updateLogicFunction,
        args: { input: { id: UNKNOWN_LOGIC_FUNCTION_ID } },
      });

      await expect(guard.canActivate(context)).rejects.toMatchObject({
        code: ApplicationExceptionCode.ENTITY_NOT_FOUND,
      });
      expect(applicationLookupService.findById).not.toHaveBeenCalled();
      expectNoOwnershipCheck();
    });
  });
});
