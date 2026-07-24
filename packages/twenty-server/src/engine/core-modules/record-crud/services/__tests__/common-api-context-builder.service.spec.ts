import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';

describe('CommonApiContextBuilderService', () => {
  const workspaceId = 'workspace-id';
  const objectId = 'company-object-id';
  const agentRoleId = 'agent-role-id';
  const defaultRoleId = 'default-role-id';

  const flatObjectMetadata = {
    id: objectId,
    nameSingular: 'company',
    namePlural: 'companies',
    labelSingular: 'Company',
    labelPlural: 'Companies',
    fieldIds: [],
  };

  const flatObjectMetadataMaps = {
    byId: { [objectId]: flatObjectMetadata },
    byUniversalIdentifier: {
      'company-universal-id': flatObjectMetadata,
    },
    idByUniversalIdentifier: {
      'company-universal-id': objectId,
    },
    universalIdentifierById: {
      [objectId]: 'company-universal-id',
    },
    universalIdentifiersByApplicationId: {},
  };

  const flatFieldMetadataMaps = {
    byId: {},
    byUniversalIdentifier: {},
    idByUniversalIdentifier: {},
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  };

  const flatIndexMaps = {
    byId: {},
    byUniversalIdentifier: {},
    idByUniversalIdentifier: {},
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  };

  const agentRolePermissions = {
    [objectId]: {
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
      restrictedFields: {},
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    },
  };

  const defaultRolePermissions = {
    [objectId]: {
      canReadObjectRecords: false,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
      restrictedFields: {},
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    },
  };

  const authContext = {
    type: 'application' as const,
    workspace: { id: workspaceId },
    application: {
      id: 'app-id',
      defaultRoleId,
      universalIdentifier: 'app-universal-id',
    },
  };

  const workspaceManyOrAllFlatEntityMapsCacheService = {
    getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
    }),
  };

  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      rolesPermissions: {
        [agentRoleId]: agentRolePermissions,
        [defaultRoleId]: defaultRolePermissions,
      },
    }),
  };

  const userRoleService = {
    getRoleIdForUserWorkspace: jest.fn(),
  };

  const apiKeyRoleService = {
    getRoleIdForApiKeyId: jest.fn(),
  };

  const buildService = () =>
    new CommonApiContextBuilderService(
      workspaceManyOrAllFlatEntityMapsCacheService as never,
      workspaceCacheService as never,
      userRoleService as never,
      apiKeyRoleService as never,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use application defaultRoleId when no rolePermissionConfig is passed', async () => {
    const service = buildService();

    const result = await service.build({
      authContext: authContext as never,
      objectName: 'company',
    });

    expect(result.objectsPermissions).toEqual(defaultRolePermissions);
    expect(result.queryRunnerContext.rolePermissionConfig).toBeUndefined();
  });

  it('should honor rolePermissionConfig over application defaultRoleId', async () => {
    const service = buildService();
    const rolePermissionConfig = { unionOf: [agentRoleId] };

    const result = await service.build({
      authContext: authContext as never,
      objectName: 'company',
      rolePermissionConfig,
    });

    expect(result.objectsPermissions).toEqual(agentRolePermissions);
    expect(result.queryRunnerContext.rolePermissionConfig).toEqual(
      rolePermissionConfig,
    );
  });
});
