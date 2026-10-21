import { type ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { APPLICATION_TARGET_METADATA_KEY } from 'src/engine/core-modules/application/constants/application-target-metadata-key.constant';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { ApplicationTargetArgs } from 'src/engine/decorators/auth/application-target-args.decorator';
import { ApplicationTargetParam } from 'src/engine/decorators/auth/application-target-param.decorator';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
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

const WORKSPACE_ID = 'workspace-id';
const OWN_LOGIC_FUNCTION_ID = '3f1c2a64-8d0e-4b7a-9c35-6e2f1a0b4d71';
const OTHER_LOGIC_FUNCTION_ID = '9b4e7d21-2c6f-4a85-b013-5d8e3f7a2c94';
const UNKNOWN_LOGIC_FUNCTION_ID = 'c7a2e5f8-4b19-4d3e-8f60-1a9b2c3d4e05';
const OTHER_APPLICATION_ID = '5e8d1c3b-7a2f-4e96-a4b0-8c1d2e3f4a56';
const OTHER_UNIVERSAL_IDENTIFIER = 'd2b6f9a4-1e3c-4708-b5a2-9f0e1d2c3b47';
const OTHER_REGISTRATION_ID = '81f3a7c5-6d2e-4b9a-a1c4-7e5f3d2b1a08';

const CALLING_APPLICATION = {
  id: '2a7d4c1e-9f3b-4e68-8d25-4b1a6c9e7f30',
  universalIdentifier: 'e4c8b2d6-3a5f-4c17-9e2b-0d6a8f4c2e19',
  applicationRegistrationId: '6b9f2e4a-8c1d-4f73-b6e5-2a7c9d1e3f82',
} as FlatApplication;

type LogicFunctionInput = { id: string; payload: object };

type ExportInput = { universalIdentifier: string };

type SyncInput = {
  manifest: { application: { universalIdentifier: string } };
  dryRun?: boolean;
};

class TestResolver {
  runHealthCheck(
    @ApplicationTargetArg('applicationId', {
      kind: 'applicationId',
      requireApplicationRegistrationOwnership: false,
    })
    _applicationId: string,
  ) {}

  exportApplication(
    @ApplicationTargetArgs<ExportInput>({
      kind: 'applicationUniversalIdentifier',
      idKey: 'universalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    _input: ExportInput,
  ) {}

  syncApplication(
    @ApplicationTargetArgs<SyncInput>({
      kind: 'applicationUniversalIdentifier',
      idKey: 'manifest.application.universalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    _input: SyncInput,
  ) {}

  findRegistration(
    @ApplicationTargetArg('id', {
      kind: 'applicationRegistrationId',
      requireApplicationRegistrationOwnership: false,
    })
    _id: string,
  ) {}

  executeLogicFunction(
    @ApplicationTargetArg<LogicFunctionInput>('input', {
      kind: 'applicationOwnedEntity',
      metadataName: 'logicFunction',
      idKey: 'id',
      requireApplicationRegistrationOwnership: false,
    })
    _input: LogicFunctionInput,
  ) {}

  getSdkModule(
    @ApplicationTargetParam('applicationId', {
      kind: 'applicationId',
      requireApplicationRegistrationOwnership: false,
    })
    _applicationId: string,
  ) {}

  undecorated() {}
}

const buildFlatLogicFunctionMaps = () => ({
  byUniversalIdentifier: {
    'own-logic-function': {
      id: OWN_LOGIC_FUNCTION_ID,
      universalIdentifier: 'own-logic-function',
      applicationId: CALLING_APPLICATION.id,
    },
    'other-logic-function': {
      id: OTHER_LOGIC_FUNCTION_ID,
      universalIdentifier: 'other-logic-function',
      applicationId: OTHER_APPLICATION_ID,
    },
  },
  universalIdentifierById: {
    [OWN_LOGIC_FUNCTION_ID]: 'own-logic-function',
    [OTHER_LOGIC_FUNCTION_ID]: 'other-logic-function',
  },
  universalIdentifiersByApplicationId: {},
});

describe('ApplicationTargetGuard', () => {
  let guard: ApplicationTargetGuard;

  const buildGraphqlContext = ({
    handler,
    args,
    application,
  }: {
    handler: (...args: never[]) => unknown;
    args: Record<string, unknown>;
    application?: FlatApplication;
  }): ExecutionContext => {
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getArgs: () => args,
      getContext: () => ({
        req: { application, workspace: { id: WORKSPACE_ID } },
      }),
    } as unknown as GqlExecutionContext);

    return {
      getType: () => 'graphql',
      getHandler: () => handler,
    } as unknown as ExecutionContext;
  };

  const buildHttpContext = ({
    handler,
    params,
    application,
  }: {
    handler: (...args: never[]) => unknown;
    params: Record<string, string>;
    application?: FlatApplication;
  }): ExecutionContext =>
    ({
      getType: () => 'http',
      getHandler: () => handler,
      switchToHttp: () => ({
        getRequest: () => ({
          application,
          params,
          workspace: { id: WORKSPACE_ID },
        }),
      }),
    }) as unknown as ExecutionContext;

  const expectForbidden = async (context: ExecutionContext) => {
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: ApplicationExceptionCode.FORBIDDEN,
    });
  };

  beforeEach(() => {
    jest.restoreAllMocks();

    guard = new ApplicationTargetGuard(
      new Reflector(),
      {} as ApplicationLookupService,
      {} as ApplicationRegistrationLookupService,
      {
        getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
          flatLogicFunctionMaps: buildFlatLogicFunctionMaps(),
        }),
      } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService,
    );
  });

  it('should record the target without attaching any guard', () => {
    expect(
      Reflect.getMetadata(
        APPLICATION_TARGET_METADATA_KEY,
        TestResolver.prototype.executeLogicFunction,
      ),
    ).toMatchObject({
      kind: 'applicationOwnedEntity',
      metadataName: 'logicFunction',
    });
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        TestResolver.prototype.executeLogicFunction,
      ),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        APPLICATION_TARGET_METADATA_KEY,
        TestResolver.prototype.undecorated,
      ),
    ).toBeUndefined();
  });

  it('should refuse a second application target on the same handler', () => {
    expect(() => {
      class DoubleTargetResolver {
        find(
          @ApplicationTargetArg('applicationId', {
            kind: 'applicationId',
            requireApplicationRegistrationOwnership: false,
          })
          _applicationId: string,
          @ApplicationTargetArg('id', {
            kind: 'applicationRegistrationId',
            requireApplicationRegistrationOwnership: false,
          })
          _id: string,
        ) {}
      }

      return DoubleTargetResolver;
    }).toThrow('declares more than one application target');
  });

  it('should let callers that are not applications through', async () => {
    await expect(
      guard.canActivate(
        buildGraphqlContext({
          handler: TestResolver.prototype.runHealthCheck,
          args: { applicationId: OTHER_APPLICATION_ID },
        }),
      ),
    ).resolves.toBe(true);
  });

  it('should let OAuth-only clients such as the CLI through', async () => {
    await expect(
      guard.canActivate(
        buildGraphqlContext({
          handler: TestResolver.prototype.exportApplication,
          args: { universalIdentifier: OTHER_UNIVERSAL_IDENTIFIER },
          application: {
            ...CALLING_APPLICATION,
            sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
          },
        }),
      ),
    ).resolves.toBe(true);
  });

  it('should let handlers without an application target through', async () => {
    await expect(
      guard.canActivate(
        buildGraphqlContext({
          handler: TestResolver.prototype.undecorated,
          args: {},
          application: CALLING_APPLICATION,
        }),
      ),
    ).resolves.toBe(true);
  });

  it('should compare an application id argument with the caller', async () => {
    await expect(
      guard.canActivate(
        buildGraphqlContext({
          handler: TestResolver.prototype.runHealthCheck,
          args: { applicationId: CALLING_APPLICATION.id },
          application: CALLING_APPLICATION,
        }),
      ),
    ).resolves.toBe(true);

    await expectForbidden(
      buildGraphqlContext({
        handler: TestResolver.prototype.runHealthCheck,
        args: { applicationId: OTHER_APPLICATION_ID },
        application: CALLING_APPLICATION,
      }),
    );
  });

  it('should compare a universal identifier read from an args type', async () => {
    await expect(
      guard.canActivate(
        buildGraphqlContext({
          handler: TestResolver.prototype.exportApplication,
          args: {
            universalIdentifier: CALLING_APPLICATION.universalIdentifier,
          },
          application: CALLING_APPLICATION,
        }),
      ),
    ).resolves.toBe(true);

    await expectForbidden(
      buildGraphqlContext({
        handler: TestResolver.prototype.exportApplication,
        args: { universalIdentifier: OTHER_UNIVERSAL_IDENTIFIER },
        application: CALLING_APPLICATION,
      }),
    );
  });

  it('should compare a universal identifier read from a nested path', async () => {
    await expect(
      guard.canActivate(
        buildGraphqlContext({
          handler: TestResolver.prototype.syncApplication,
          args: {
            manifest: {
              application: {
                universalIdentifier: CALLING_APPLICATION.universalIdentifier,
              },
            },
          },
          application: CALLING_APPLICATION,
        }),
      ),
    ).resolves.toBe(true);

    await expectForbidden(
      buildGraphqlContext({
        handler: TestResolver.prototype.syncApplication,
        args: {
          manifest: {
            application: { universalIdentifier: OTHER_UNIVERSAL_IDENTIFIER },
          },
        },
        application: CALLING_APPLICATION,
      }),
    );

    await expect(
      guard.canActivate(
        buildGraphqlContext({
          handler: TestResolver.prototype.syncApplication,
          args: { manifest: {} },
          application: CALLING_APPLICATION,
        }),
      ),
    ).rejects.toMatchObject({
      code: ApplicationExceptionCode.INVALID_INPUT,
      message:
        'Application target "manifest.application.universalIdentifier" must be a UUID',
    });
  });

  it('should compare a registration id with the caller registration', async () => {
    await expect(
      guard.canActivate(
        buildGraphqlContext({
          handler: TestResolver.prototype.findRegistration,
          args: { id: CALLING_APPLICATION.applicationRegistrationId },
          application: CALLING_APPLICATION,
        }),
      ),
    ).resolves.toBe(true);

    await expectForbidden(
      buildGraphqlContext({
        handler: TestResolver.prototype.findRegistration,
        args: { id: OTHER_REGISTRATION_ID },
        application: CALLING_APPLICATION,
      }),
    );
  });

  it('should compare the owner of an entity read from an input argument', async () => {
    await expect(
      guard.canActivate(
        buildGraphqlContext({
          handler: TestResolver.prototype.executeLogicFunction,
          args: { input: { id: OWN_LOGIC_FUNCTION_ID, payload: {} } },
          application: CALLING_APPLICATION,
        }),
      ),
    ).resolves.toBe(true);

    await expectForbidden(
      buildGraphqlContext({
        handler: TestResolver.prototype.executeLogicFunction,
        args: { input: { id: OTHER_LOGIC_FUNCTION_ID, payload: {} } },
        application: CALLING_APPLICATION,
      }),
    );
  });

  it('should leave unknown entity ids to the resolver', async () => {
    await expect(
      guard.canActivate(
        buildGraphqlContext({
          handler: TestResolver.prototype.executeLogicFunction,
          args: { input: { id: UNKNOWN_LOGIC_FUNCTION_ID, payload: {} } },
          application: CALLING_APPLICATION,
        }),
      ),
    ).resolves.toBe(true);
  });

  it.each([
    { title: 'missing', args: {} },
    { title: 'empty', args: { input: { id: '', payload: {} } } },
    { title: 'malformed', args: { input: { id: 'not-a-uuid', payload: {} } } },
  ])(
    'should refuse an application caller whose target is $title',
    async ({ args }) => {
      await expect(
        guard.canActivate(
          buildGraphqlContext({
            handler: TestResolver.prototype.executeLogicFunction,
            args,
            application: CALLING_APPLICATION,
          }),
        ),
      ).rejects.toMatchObject({
        code: ApplicationExceptionCode.INVALID_INPUT,
        message: 'Application target "input.id" must be a UUID',
      });
    },
  );

  it('should read the target from a route parameter', async () => {
    await expect(
      guard.canActivate(
        buildHttpContext({
          handler: TestResolver.prototype.getSdkModule,
          params: { applicationId: CALLING_APPLICATION.id },
          application: CALLING_APPLICATION,
        }),
      ),
    ).resolves.toBe(true);

    await expectForbidden(
      buildHttpContext({
        handler: TestResolver.prototype.getSdkModule,
        params: { applicationId: OTHER_APPLICATION_ID },
        application: CALLING_APPLICATION,
      }),
    );
  });
});

const APPLICATION_ID = '4d2a8f6c-1b3e-4c95-a7d0-3e9f1b5c7a24';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'a8e3c1f5-6b2d-4a79-9c14-7f0d2e4b6a83';
const LINKED_REGISTRATION_ID = 'f1b7d3a9-2e4c-4d68-b0a5-9c3e7f1d5b26';
const LOGIC_FUNCTION_ID = '7c5e9a1d-3f8b-4e20-8a64-1d9b3f7e5c48';
const TARGETED_REGISTRATION_ID = 'b3d9f5c1-7a2e-4b84-9e36-5a1c7e3b9d60';
const FOREIGN_REGISTRATION_ID = '0e6a2c8f-4d1b-4f97-a3c5-8b2e6d0f4a19';
const UNKNOWN_APPLICATION_ID = '92c4e8b6-5f1a-4d3c-b7e9-6a0f2c8e4b75';

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

type OwnedLogicFunctionInput = { id: string };

class OwnershipTestResolver {
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
    @ApplicationTargetArg<OwnedLogicFunctionInput>('input', {
      kind: 'applicationOwnedEntity',
      metadataName: 'logicFunction',
      idKey: 'id',
      requireApplicationRegistrationOwnership: true,
    })
    _input: OwnedLogicFunctionInput,
  ) {}
}

const buildOwnedFlatLogicFunctionMaps = () => ({
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

describe('ApplicationTargetGuard registration ownership', () => {
  let guard: ApplicationTargetGuard;

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
    application,
  }: {
    handler: (...args: never[]) => unknown;
    args: Record<string, unknown>;
    workspace?: { id: string } | null;
    application?: FlatApplication;
  }): ExecutionContext => {
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getArgs: () => args,
      getContext: () => ({ req: { workspace, application } }),
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

    guard = new ApplicationTargetGuard(
      new Reflector(),
      applicationLookupService as unknown as ApplicationLookupService,
      applicationRegistrationLookupService as unknown as ApplicationRegistrationLookupService,
      {
        getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
          flatLogicFunctionMaps: buildOwnedFlatLogicFunctionMaps(),
        }),
      } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService,
    );
  });

  it('should skip the check when the handler does not require ownership', async () => {
    const context = buildContext({
      handler: OwnershipTestResolver.prototype.nonOwnershipUpload,
      args: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expectNoOwnershipCheck();
  });

  it('should refuse when the workspace is missing from the request', async () => {
    const context = buildContext({
      handler: OwnershipTestResolver.prototype.ownedUpload,
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
        handler: OwnershipTestResolver.prototype.ownedUpload,
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
      handler: OwnershipTestResolver.prototype.ownedUpload,
      args: {
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      },
    });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      code: ApplicationExceptionCode.FORBIDDEN,
    });
  });

  it('should confine an application token before checking ownership', async () => {
    const callingApplication = {
      ...LINKED_APPLICATION,
      sourceType: ApplicationRegistrationSourceType.NPM,
    } as unknown as FlatApplication;

    await expect(
      guard.canActivate(
        buildContext({
          handler: OwnershipTestResolver.prototype.ownedUpload,
          args: {
            applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          },
          application: callingApplication,
        }),
      ),
    ).resolves.toBe(true);
    expect(
      applicationRegistrationLookupService.findOneByIdOwnedByWorkspaceOrThrow,
    ).toHaveBeenCalledWith({
      applicationRegistrationId: LINKED_REGISTRATION_ID,
      workspaceId: WORKSPACE_ID,
    });

    jest.clearAllMocks();

    await expect(
      guard.canActivate(
        buildContext({
          handler: OwnershipTestResolver.prototype.ownedUpload,
          args: { applicationUniversalIdentifier: OTHER_UNIVERSAL_IDENTIFIER },
          application: callingApplication,
        }),
      ),
    ).rejects.toMatchObject({ code: ApplicationExceptionCode.FORBIDDEN });
    expect(
      applicationLookupService.findByUniversalIdentifier,
    ).not.toHaveBeenCalled();
    expectNoOwnershipCheck();
  });

  describe('applicationUniversalIdentifier', () => {
    it('should check the registration the application row links to', async () => {
      const context = buildContext({
        handler: OwnershipTestResolver.prototype.ownedUpload,
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
          handler: OwnershipTestResolver.prototype.ownedUpload,
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
        handler: OwnershipTestResolver.prototype.updateRegistration,
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
        handler: OwnershipTestResolver.prototype.updateRegistration,
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
        handler: OwnershipTestResolver.prototype.updateApplication,
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
        handler: OwnershipTestResolver.prototype.updateApplication,
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
        handler: OwnershipTestResolver.prototype.updateApplication,
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
        handler: OwnershipTestResolver.prototype.updateLogicFunction,
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
        handler: OwnershipTestResolver.prototype.updateLogicFunction,
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
