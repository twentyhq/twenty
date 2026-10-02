import { RelatedPersonIdsService } from 'src/engine/core-modules/related-person-ids/services/related-person-ids.service';
import { findRelationPathsToPerson } from 'src/engine/core-modules/related-person-ids/utils/find-relation-paths-to-person.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

jest.mock(
  'src/engine/core-modules/related-person-ids/utils/find-relation-paths-to-person.util',
  () => ({ findRelationPathsToPerson: jest.fn() }),
);

const WORKSPACE_ID = 'workspace-id';
const COMPANY_ID = 'company-id';

const PERSON_PATH = [
  {
    direction: RelationType.ONE_TO_MANY,
    queryObjectNameSingular: 'person',
    joinColumnName: 'companyId',
  },
];
const OPPORTUNITY_PATH = [
  {
    direction: RelationType.ONE_TO_MANY,
    queryObjectNameSingular: 'opportunity',
    joinColumnName: 'companyId',
  },
  {
    direction: RelationType.MANY_TO_ONE,
    queryObjectNameSingular: 'opportunity',
    joinColumnName: 'pointOfContactId',
  },
];

const setup = (findByObjectName: Record<string, jest.Mock>) => {
  const executeInWorkspaceContext = jest.fn((callback: () => unknown) =>
    callback(),
  );
  const getRepositoryWithContextPermissions = jest.fn(
    (objectNameSingular: string) => ({
      find: findByObjectName[objectNameSingular],
    }),
  );
  const getRepository = jest.fn();
  const workspaceOrmManager = {
    executeInWorkspaceContext,
    getRepositoryWithContextPermissions,
    getRepository,
  } as unknown as WorkspaceOrmManager;
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatObjectMetadataMaps: {},
      flatFieldMetadataMaps: {},
    }),
  } as unknown as WorkspaceCacheService;

  jest
    .mocked(findRelationPathsToPerson)
    .mockReturnValue([PERSON_PATH, OPPORTUNITY_PATH]);

  return {
    service: new RelatedPersonIdsService(
      workspaceOrmManager,
      workspaceCacheService,
    ),
    executeInWorkspaceContext,
    getRepositoryWithContextPermissions,
    getRepository,
  };
};

const getCompanyPersonIds = (service: RelatedPersonIdsService) =>
  service.getRelatedPersonIds({
    workspaceId: WORKSPACE_ID,
    objectNameSingular: 'company',
    recordId: COMPANY_ID,
  });

describe('RelatedPersonIdsService', () => {
  it('should walk relation paths with the caller permissions', async () => {
    const {
      service,
      executeInWorkspaceContext,
      getRepositoryWithContextPermissions,
      getRepository,
    } = setup({
      person: jest.fn().mockResolvedValue([{ id: 'person-1' }]),
      opportunity: jest
        .fn()
        .mockResolvedValueOnce([{ id: 'opportunity-1' }])
        .mockResolvedValueOnce([{ pointOfContactId: 'person-2' }]),
    });

    await expect(getCompanyPersonIds(service)).resolves.toEqual([
      'person-1',
      'person-2',
    ]);
    expect(executeInWorkspaceContext).toHaveBeenCalledWith(
      expect.any(Function),
    );
    expect(getRepositoryWithContextPermissions).toHaveBeenCalledWith('person');
    expect(getRepository).not.toHaveBeenCalled();
  });

  it('should drop a path the caller cannot read and keep the others', async () => {
    const { service } = setup({
      person: jest.fn().mockResolvedValue([{ id: 'person-1' }]),
      opportunity: jest
        .fn()
        .mockRejectedValue(
          new PermissionsException(
            PermissionsExceptionMessage.PERMISSION_DENIED,
            PermissionsExceptionCode.PERMISSION_DENIED,
          ),
        ),
    });

    await expect(getCompanyPersonIds(service)).resolves.toEqual(['person-1']);
  });

  it('should rethrow errors other than permission denials', async () => {
    const { service } = setup({
      person: jest.fn().mockRejectedValue(new Error('database unavailable')),
      opportunity: jest.fn().mockResolvedValue([]),
    });

    await expect(getCompanyPersonIds(service)).rejects.toThrow(
      'database unavailable',
    );
  });
});
