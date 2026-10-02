import { TimelineRecordAccessService } from 'src/engine/core-modules/target/services/timeline-record-access.service';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

jest.mock(
  'src/engine/twenty-orm/storage/orm-workspace-context.storage',
  () => ({ getWorkspaceContext: jest.fn() }),
);

const RECORD_ID = 'company-record-id';
const MEMBER_ROLE_ID = 'member-role-id';

const OBJECT_ID_BY_NAME_SINGULAR = {
  company: 'company-object-id',
  messageThread: 'message-thread-object-id',
  message: 'message-object-id',
};

const setup = ({
  authContext = { type: 'user', userWorkspaceId: 'membership' },
  userWorkspaceRoleMap = { membership: MEMBER_ROLE_ID },
  readableObjectNames = ['company', 'messageThread', 'message'],
  readableRecordIds = [RECORD_ID],
}: {
  authContext?: Record<string, unknown>;
  userWorkspaceRoleMap?: Record<string, string>;
  readableObjectNames?: string[];
  readableRecordIds?: string[];
} = {}) => {
  const findRecordIdsAllowedForOperation = jest
    .fn()
    .mockResolvedValue(readableRecordIds);
  const getRepository = jest
    .fn()
    .mockReturnValue({ findRecordIdsAllowedForOperation });
  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((callback: () => unknown) => callback()),
    getRepository,
  } as unknown as WorkspaceOrmManager;

  jest.mocked(getWorkspaceContext).mockReturnValue({
    authContext,
    userWorkspaceRoleMap,
    apiKeyRoleMap: {},
    objectIdByNameSingular: OBJECT_ID_BY_NAME_SINGULAR,
    permissionsPerRoleId: {
      [MEMBER_ROLE_ID]: Object.fromEntries(
        Object.entries(OBJECT_ID_BY_NAME_SINGULAR).map(
          ([objectNameSingular, objectMetadataId]) => [
            objectMetadataId,
            {
              canReadObjectRecords:
                readableObjectNames.includes(objectNameSingular),
            },
          ],
        ),
      ),
    },
  } as never);

  return {
    service: new TimelineRecordAccessService(workspaceOrmManager),
    getRepository,
    findRecordIdsAllowedForOperation,
  };
};

const canReadCompanyThreads = (service: TimelineRecordAccessService) =>
  service.canReadRecordTimeline({
    objectNameSingular: 'company',
    recordId: RECORD_ID,
    timelineObjectNamesSingular: ['messageThread', 'message'],
  });

describe('TimelineRecordAccessService', () => {
  it('should allow the timeline when the caller can read the record and the timeline objects', async () => {
    const { service, getRepository, findRecordIdsAllowedForOperation } =
      setup();

    await expect(canReadCompanyThreads(service)).resolves.toBe(true);
    expect(getRepository).toHaveBeenCalledWith('company', {
      intersectionOf: [MEMBER_ROLE_ID],
    });
    expect(findRecordIdsAllowedForOperation).toHaveBeenCalledWith({
      recordIds: [RECORD_ID],
      operationType: 'select',
      withDeleted: true,
    });
  });

  it('should deny the timeline when row-level permissions hide the record', async () => {
    const { service } = setup({ readableRecordIds: [] });

    await expect(canReadCompanyThreads(service)).resolves.toBe(false);
  });

  it('should deny the timeline without read access on a timeline object', async () => {
    const { service, getRepository } = setup({
      readableObjectNames: ['company', 'messageThread'],
    });

    await expect(canReadCompanyThreads(service)).resolves.toBe(false);
    expect(getRepository).not.toHaveBeenCalled();
  });

  it('should deny the timeline when the caller has no role', async () => {
    const { service, getRepository } = setup({ userWorkspaceRoleMap: {} });

    await expect(canReadCompanyThreads(service)).resolves.toBe(false);
    expect(getRepository).not.toHaveBeenCalled();
  });

  it('should deny the timeline of an unknown object', async () => {
    const { service, getRepository } = setup();

    await expect(
      service.canReadRecordTimeline({
        objectNameSingular: 'notAnObject',
        recordId: RECORD_ID,
        timelineObjectNamesSingular: ['messageThread', 'message'],
      }),
    ).resolves.toBe(false);
    expect(getRepository).not.toHaveBeenCalled();
  });

  it('should skip object checks for a system context', async () => {
    const { service, getRepository } = setup({
      authContext: { type: 'system' },
      readableObjectNames: [],
    });

    await expect(canReadCompanyThreads(service)).resolves.toBe(true);
    expect(getRepository).toHaveBeenCalledWith('company', {
      shouldBypassPermissionChecks: true,
    });
  });
});
