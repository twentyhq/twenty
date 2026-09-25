import { type ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { ApplicationTargetArgs } from 'src/engine/decorators/auth/application-target-args.decorator';
import { ApplicationTargetParam } from 'src/engine/decorators/auth/application-target-param.decorator';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

const WORKSPACE_ID = 'workspace-id';
const OWN_LOGIC_FUNCTION_ID = 'own-logic-function-id';
const OTHER_LOGIC_FUNCTION_ID = 'other-logic-function-id';

const CALLING_APPLICATION = {
  id: 'calling-application-id',
  universalIdentifier: 'calling-application-universal-identifier',
  applicationRegistrationId: 'calling-application-registration-id',
} as FlatApplication;

type LogicFunctionInput = { id: string; payload: object };

type ExportInput = { universalIdentifier: string };

type SyncInput = {
  manifest: { application: { universalIdentifier: string } };
  dryRun?: boolean;
};

class TestResolver {
  runHealthCheck(
    @ApplicationTargetArg('applicationId', { kind: 'applicationId' })
    _applicationId: string,
  ) {}

  exportApplication(
    @ApplicationTargetArgs<ExportInput>({
      kind: 'applicationUniversalIdentifier',
      idKey: 'universalIdentifier',
    })
    _input: ExportInput,
  ) {}

  syncApplication(
    @ApplicationTargetArgs<SyncInput>({
      kind: 'applicationUniversalIdentifier',
      idKey: 'manifest.application.universalIdentifier',
    })
    _input: SyncInput,
  ) {}

  findRegistration(
    @ApplicationTargetArg('id', { kind: 'applicationRegistrationId' })
    _id: string,
  ) {}

  executeLogicFunction(
    @ApplicationTargetArg<LogicFunctionInput>('input', {
      kind: 'applicationOwnedEntity',
      metadataName: 'logicFunction',
      idKey: 'id',
    })
    _input: LogicFunctionInput,
  ) {}

  getSdkModule(
    @ApplicationTargetParam('applicationId', { kind: 'applicationId' })
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
      applicationId: 'other-application-id',
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

  it('should attach the guard to every decorated handler', () => {
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        TestResolver.prototype.executeLogicFunction,
      ),
    ).toEqual([ApplicationTargetGuard]);
    expect(
      Reflect.getMetadata(GUARDS_METADATA, TestResolver.prototype.undecorated),
    ).toBeUndefined();
  });

  it('should refuse a second application target on the same handler', () => {
    expect(() => {
      class DoubleTargetResolver {
        find(
          @ApplicationTargetArg('applicationId', { kind: 'applicationId' })
          _applicationId: string,
          @ApplicationTargetArg('id', { kind: 'applicationRegistrationId' })
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
          args: { applicationId: 'other-application-id' },
        }),
      ),
    ).resolves.toBe(true);
  });

  it('should let OAuth-only clients such as the CLI through', async () => {
    await expect(
      guard.canActivate(
        buildGraphqlContext({
          handler: TestResolver.prototype.exportApplication,
          args: { universalIdentifier: 'other-universal-identifier' },
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
        args: { applicationId: 'other-application-id' },
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
        args: { universalIdentifier: 'other-universal-identifier' },
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
            application: { universalIdentifier: 'other-universal-identifier' },
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
      message:
        'Missing application target "manifest.application.universalIdentifier"',
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
        args: { id: 'other-registration-id' },
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
          args: { input: { id: 'unknown-logic-function-id', payload: {} } },
          application: CALLING_APPLICATION,
        }),
      ),
    ).resolves.toBe(true);
  });

  it('should refuse an application caller when the target cannot be read', async () => {
    await expect(
      guard.canActivate(
        buildGraphqlContext({
          handler: TestResolver.prototype.executeLogicFunction,
          args: {},
          application: CALLING_APPLICATION,
        }),
      ),
    ).rejects.toMatchObject({
      code: ApplicationExceptionCode.FORBIDDEN,
      message: 'Missing application target "input.id"',
    });
  });

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
        params: { applicationId: 'other-application-id' },
        application: CALLING_APPLICATION,
      }),
    );
  });
});
