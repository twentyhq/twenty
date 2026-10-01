import { type ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { APPLICATION_TARGET_METADATA_KEY } from 'src/engine/core-modules/application/constants/application-target-metadata-key.constant';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { ApplicationTargetArgs } from 'src/engine/decorators/auth/application-target-args.decorator';
import { ApplicationTargetParam } from 'src/engine/decorators/auth/application-target-param.decorator';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

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

    guard = new ApplicationTargetGuard(new Reflector(), {
      getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
        flatLogicFunctionMaps: buildFlatLogicFunctionMaps(),
      }),
    } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService);
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
