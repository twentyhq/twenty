import { type INestApplication, UseGuards } from '@nestjs/common';
import {
  GraphQLModule,
  GraphQLSchemaHost,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { Test } from '@nestjs/testing';

import { YogaDriver, type YogaDriverConfig } from '@graphql-yoga/nestjs';
import { type GraphQLSchema, graphql } from 'graphql';
import { PermissionFlagType } from 'twenty-shared/constants';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { ApplicationCapabilityResolver } from 'src/engine/core-modules/application/application-install/application-capability.resolver';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

const APPLICATION_ID = 'c832302c-e551-4b4f-b11c-19907888a284';
const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const WORKSPACE = {
  id: WORKSPACE_ID,
  activationStatus: WorkspaceActivationStatus.ACTIVE,
};
const USER_REQUEST = {
  tokenType: JwtTokenTypeEnum.ACCESS,
  workspace: WORKSPACE,
  user: { id: 'user-id' },
  userWorkspaceId: 'user-workspace-id',
};

@Resolver()
class TestQueryResolver {
  @Query(() => Boolean)
  @UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
  isReady(): boolean {
    return true;
  }
}

describe('ApplicationCapabilityResolver', () => {
  let app: INestApplication;
  let schema: GraphQLSchema;
  const applicationService = {
    findOneApplicationWithRelationsOrThrow: jest.fn(),
    update: jest.fn(),
  };
  const permissionsService = {
    userHasWorkspaceSettingPermission: jest.fn(),
  };

  const grantCapabilities = ({
    request = USER_REQUEST,
    capabilities = ['microphone'],
  }: {
    request?: Record<string, unknown>;
    capabilities?: string[];
  } = {}) =>
    graphql({
      schema,
      source: `mutation Grant($input: GrantApplicationCapabilitiesInput!) {
      grantApplicationCapabilities(input: $input) { id grantedCapabilities }
    }`,
      variableValues: {
        input: { applicationId: APPLICATION_ID, capabilities },
      },
      contextValue: { req: request },
    });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<YogaDriverConfig>({
          driver: YogaDriver,
          autoSchemaFile: true,
        }),
      ],
      providers: [
        TestQueryResolver,
        ApplicationCapabilityResolver,
        { provide: ApplicationService, useValue: applicationService },
        { provide: PermissionsService, useValue: permissionsService },
      ],
    }).compile();

    app = moduleRef.createNestApplication({ logger: false });
    await app.init();
    schema = app.get(GraphQLSchemaHost).schema;
  });

  beforeEach(() => {
    jest.resetAllMocks();
    permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
      true,
    );
    applicationService.findOneApplicationWithRelationsOrThrow.mockResolvedValue(
      {
        id: APPLICATION_ID,
      },
    );
    applicationService.update.mockResolvedValue({
      id: APPLICATION_ID,
      grantedCapabilities: ['microphone', 'camera'],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('grants workspace-wide access for members who can manage apps', async () => {
    const result = await grantCapabilities();

    expect(result.errors).toBeUndefined();
    expect(result.data?.grantApplicationCapabilities).toEqual({
      id: APPLICATION_ID,
      grantedCapabilities: ['microphone', 'camera'],
    });
    expect(
      permissionsService.userHasWorkspaceSettingPermission,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_REQUEST.userWorkspaceId,
        setting: PermissionFlagType.APPLICATIONS,
      }),
    );
    expect(
      applicationService.findOneApplicationWithRelationsOrThrow,
    ).toHaveBeenCalledWith({
      id: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
    });
    expect(applicationService.update).toHaveBeenCalledWith(APPLICATION_ID, {
      workspaceId: WORKSPACE_ID,
      grantedCapabilities: expect.any(Function),
    });
  });

  it.each([
    {
      name: 'an application token acting on behalf of a user',
      request: {
        ...USER_REQUEST,
        tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
        application: { id: APPLICATION_ID },
      },
    },
    {
      name: 'an application token',
      request: { workspace: WORKSPACE, application: { id: APPLICATION_ID } },
    },
    {
      name: 'an API key',
      request: { workspace: WORKSPACE, apiKey: { id: 'api-key-id' } },
    },
    { name: 'an unauthenticated request', request: { workspace: WORKSPACE } },
  ])('does not allow $name to approve access', async ({ request }) => {
    const result = await grantCapabilities({ request });

    expect(result.errors).toHaveLength(1);
    expect(applicationService.update).not.toHaveBeenCalled();
  });

  it('rejects members without the manage-apps permission', async () => {
    permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
      false,
    );

    const result = await grantCapabilities();

    expect(result.errors).toHaveLength(1);
    expect(applicationService.update).not.toHaveBeenCalled();
  });

  it('does not update an application outside the current workspace', async () => {
    applicationService.findOneApplicationWithRelationsOrThrow.mockRejectedValue(
      new ApplicationException(
        'Application not found',
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      ),
    );

    const result = await grantCapabilities();

    expect(result.errors).toHaveLength(1);
    expect(applicationService.update).not.toHaveBeenCalled();
  });

  it.each([
    { name: 'unsupported', capabilities: ['screen'] },
    { name: 'empty', capabilities: [] },
    { name: 'duplicate', capabilities: ['microphone', 'microphone'] },
  ])('rejects $name capabilities', async ({ capabilities }) => {
    const result = await grantCapabilities({ capabilities });

    expect(result.errors).toHaveLength(1);
    expect(applicationService.update).not.toHaveBeenCalled();
  });
});
