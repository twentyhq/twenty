/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  MetadataReadability,
  ObjectSharingReach,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { type RecordShareEntry } from 'src/engine/core-modules/record-share/types/record-share-entry.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const OBJECT_METADATA_ID = 'object-metadata-id';
const RECORD_ID = 'record-id';
const VIEWER_WORKSPACE_MEMBER_ID = 'viewer-workspace-member-id';
const GRANTEE_WORKSPACE_MEMBER_ID = 'grantee-workspace-member-id';
const REMOVED_ROLE_ID = 'removed-role-id';

const SHARE_ENTRIES: RecordShareEntry[] = [
  {
    principalId: GRANTEE_WORKSPACE_MEMBER_ID,
    principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
    accessLevel: RecordShareAccessLevel.READ,
  },
  {
    principalId: REMOVED_ROLE_ID,
    principalType: RecordSharePrincipalType.ROLE,
    accessLevel: RecordShareAccessLevel.NONE,
  },
  {
    principalId: EVERYONE_PRINCIPAL_ID,
    principalType: RecordSharePrincipalType.EVERYONE,
    accessLevel: RecordShareAccessLevel.READ_WRITE,
  },
];

const VIEWER_AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
  userWorkspaceId: 'viewer-user-workspace-id',
  workspaceMemberId: VIEWER_WORKSPACE_MEMBER_ID,
} as unknown as UserWorkspaceAuthContext;

const buildViewerShare = (accessLevel: RecordShareAccessLevel) => ({
  id: 'viewer-share-id',
  objectMetadataId: OBJECT_METADATA_ID,
  recordId: RECORD_ID,
  principalId: VIEWER_WORKSPACE_MEMBER_ID,
  principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
  accessLevel,
  rowCause: RecordShareRowCause.OWNER,
  sourceId: RECORD_ID,
});

const buildService = ({
  readability = MetadataReadability.PRIVATE,
  isRecordFound = true,
  viewerAccessLevel = RecordShareAccessLevel.FULL,
}: {
  readability?: MetadataReadability;
  isRecordFound?: boolean;
  viewerAccessLevel?: RecordShareAccessLevel;
} = {}) => {
  const flatObjectMetadata = {
    id: OBJECT_METADATA_ID,
    nameSingular: 'agentChatThread',
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    readability,
    isSystem: true,
    sharingReach: ObjectSharingReach.ROLE_ACCESS,
  };
  const transactionScope = {
    workspaceId: WORKSPACE_ID,
    executeRawQuery: jest.fn(async (sql: string) =>
      sql.includes('FOR UPDATE') && isRecordFound ? [{ id: RECORD_ID }] : [],
    ),
  };
  const contextRepository = {
    findRecordIdsAllowedForOperation: jest.fn().mockResolvedValue([RECORD_ID]),
    isObjectOperationPermittedByRole: jest.fn().mockReturnValue(true),
  };
  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((work: () => unknown) => work()),
    runInWorkspaceTransaction: jest.fn(
      (work: (scope: typeof transactionScope) => unknown) =>
        work(transactionScope),
    ),
    getRepositoryWithContextPermissions: jest.fn(() => contextRepository),
  };
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatObjectMetadataMaps: {
        universalIdentifierById: {
          [OBJECT_METADATA_ID]: 'object-universal-identifier',
        },
        byUniversalIdentifier: {
          'object-universal-identifier': flatObjectMetadata,
        },
      },
      featureFlagsMap: {
        [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
      },
      userWorkspaceRoleMap: {},
      apiKeyRoleMap: {},
      flatRoleTargetByAgentIdMaps: {},
      roleIdsWithAllRecordsAccess: [],
    }),
  };
  const recordShareStorageService = {
    setManualShare: jest.fn().mockResolvedValue(undefined),
    findByRecordIds: jest
      .fn()
      .mockResolvedValue([buildViewerShare(viewerAccessLevel)]),
  };
  const recordSharePrincipalService = {
    assertPrincipalsReachRecordsOrThrow: jest.fn().mockResolvedValue(undefined),
  };
  const recordPermissionsService = {
    getPermissionsForRecords: jest.fn().mockResolvedValue(new Map()),
  };

  const service = new RecordSharingService(
    workspaceOrmManager as never,
    workspaceCacheService as never,
    recordShareStorageService as never,
    recordSharePrincipalService as never,
    recordPermissionsService as never,
  );

  return {
    service,
    transactionScope,
    workspaceOrmManager,
    recordShareStorageService,
    recordSharePrincipalService,
  };
};

const expectEveryShareEntryWritten = ({
  recordShareStorageService,
  recordSharePrincipalService,
  transactionScope,
}: Pick<
  ReturnType<typeof buildService>,
  | 'recordShareStorageService'
  | 'recordSharePrincipalService'
  | 'transactionScope'
>) => {
  const shareTarget = {
    objectMetadataId: OBJECT_METADATA_ID,
    recordId: RECORD_ID,
    sourceId: RECORD_ID,
  };

  expect(recordShareStorageService.setManualShare.mock.calls).toEqual([
    [
      {
        workspaceId: WORKSPACE_ID,
        transactionScope,
        enabled: true,
        share: { ...SHARE_ENTRIES[0], ...shareTarget },
      },
    ],
    [
      {
        workspaceId: WORKSPACE_ID,
        transactionScope,
        enabled: false,
        share: { ...SHARE_ENTRIES[1], ...shareTarget },
      },
    ],
    [
      {
        workspaceId: WORKSPACE_ID,
        transactionScope,
        enabled: true,
        share: { ...SHARE_ENTRIES[2], ...shareTarget },
      },
    ],
  ]);
  expect(
    recordSharePrincipalService.assertPrincipalsReachRecordsOrThrow,
  ).toHaveBeenCalledTimes(1);
  expect(
    recordSharePrincipalService.assertPrincipalsReachRecordsOrThrow,
  ).toHaveBeenCalledWith(
    expect.objectContaining({
      transactionScope,
      principals: [SHARE_ENTRIES[0], SHARE_ENTRIES[2]],
      recordIds: [RECORD_ID],
    }),
  );
};

describe('RecordSharingService.setShares', () => {
  it('writes every share of a full access holder in one change, then checks the granted principals once', async () => {
    const {
      service,
      transactionScope,
      workspaceOrmManager,
      recordShareStorageService,
      recordSharePrincipalService,
    } = buildService();

    await service.setShares({
      objectMetadataId: OBJECT_METADATA_ID,
      recordId: RECORD_ID,
      authContext: VIEWER_AUTH_CONTEXT,
      shareEntries: SHARE_ENTRIES,
    });

    expect(workspaceOrmManager.runInWorkspaceTransaction).toHaveBeenCalledTimes(
      1,
    );
    expectEveryShareEntryWritten({
      recordShareStorageService,
      recordSharePrincipalService,
      transactionScope,
    });
  });

  it('refuses a viewer who can only edit the record', async () => {
    const { service, recordShareStorageService } = buildService({
      viewerAccessLevel: RecordShareAccessLevel.READ_WRITE,
    });

    await expect(
      service.setShares({
        objectMetadataId: OBJECT_METADATA_ID,
        recordId: RECORD_ID,
        authContext: VIEWER_AUTH_CONTEXT,
        shareEntries: SHARE_ENTRIES,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(recordShareStorageService.setManualShare).not.toHaveBeenCalled();
  });
});

describe('RecordSharingService.writeSharesAsSystem', () => {
  it('writes every share under the lock of the record without a viewer', async () => {
    const {
      service,
      transactionScope,
      recordShareStorageService,
      recordSharePrincipalService,
    } = buildService({ viewerAccessLevel: RecordShareAccessLevel.READ });

    await service.writeSharesAsSystem({
      workspaceId: WORKSPACE_ID,
      objectMetadataId: OBJECT_METADATA_ID,
      recordId: RECORD_ID,
      shareEntries: SHARE_ENTRIES,
    });

    expect(transactionScope.executeRawQuery.mock.calls).toEqual([
      [
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [`record-share:${WORKSPACE_ID}:${OBJECT_METADATA_ID}:${RECORD_ID}`],
      ],
      [expect.stringContaining('FOR UPDATE'), [RECORD_ID]],
    ]);
    expect(recordShareStorageService.findByRecordIds).not.toHaveBeenCalled();
    expectEveryShareEntryWritten({
      recordShareStorageService,
      recordSharePrincipalService,
      transactionScope,
    });
  });

  it('removes the general access row when everyone is set back to the default level', async () => {
    const { service, recordShareStorageService } = buildService();

    await service.writeSharesAsSystem({
      workspaceId: WORKSPACE_ID,
      objectMetadataId: OBJECT_METADATA_ID,
      recordId: RECORD_ID,
      shareEntries: [
        {
          principalId: EVERYONE_PRINCIPAL_ID,
          principalType: RecordSharePrincipalType.EVERYONE,
          accessLevel: RecordShareAccessLevel.NONE,
        },
      ],
    });

    expect(recordShareStorageService.setManualShare).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
        share: expect.objectContaining({
          principalType: RecordSharePrincipalType.EVERYONE,
        }),
      }),
    );
  });

  it('refuses a record that does not exist', async () => {
    const { service, recordShareStorageService } = buildService({
      isRecordFound: false,
    });

    await expect(
      service.writeSharesAsSystem({
        workspaceId: WORKSPACE_ID,
        objectMetadataId: OBJECT_METADATA_ID,
        recordId: RECORD_ID,
        shareEntries: SHARE_ENTRIES,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(recordShareStorageService.setManualShare).not.toHaveBeenCalled();
  });

  it('refuses the records of an object shared only through roles', async () => {
    const { service, workspaceOrmManager } = buildService({
      readability: MetadataReadability.OPEN,
    });

    await expect(
      service.writeSharesAsSystem({
        workspaceId: WORKSPACE_ID,
        objectMetadataId: OBJECT_METADATA_ID,
        recordId: RECORD_ID,
        shareEntries: SHARE_ENTRIES,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(
      workspaceOrmManager.runInWorkspaceTransaction,
    ).not.toHaveBeenCalled();
  });
});
