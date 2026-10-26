import {
  RecordShareAccessLevel,
  RecordShareRowCause,
  type RecordPermissionAction,
} from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { type RecordSharePrincipalService } from 'src/engine/core-modules/record-share/services/record-share-principal.service';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { ShareWithService } from 'src/engine/core-modules/record-share/services/share-with.service';
import { type ObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

jest.mock('src/engine/twenty-orm/storage/orm-workspace-context.storage');

const RECORD_ID = '20202020-0000-4000-8000-000000000001';
const MEMBER_ID = '20202020-0000-4000-8000-000000000002';
const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

describe('ShareWithService with active record permissions', () => {
  const storage = { deleteByRecordIds: jest.fn(), insertMany: jest.fn() };
  const principals = { assertPrincipalsReachRecordsOrThrow: jest.fn() };
  const allowed = jest.fn<
    Promise<string[]>,
    [{ action: RecordPermissionAction }]
  >();
  const transactionScope = {
    getRepository: () => ({
      findRecordIdsAllowedForRecordPermissionAction: allowed,
    }),
  } as unknown as WorkspaceTransactionScope;
  const service = new ShareWithService(
    storage as unknown as RecordShareStorageService,
    principals as unknown as RecordSharePrincipalService,
    {} as WorkspaceCacheService,
  );
  const input = {
    flatObjectMetadata: getFlatObjectMetadataMock({
      universalIdentifier: RECORD_ID,
    }),
    objectSharing: { sharingMode: RecordSharingMode.PRIVATE } as ObjectSharing,
    recordIds: [RECORD_ID],
    apiKeyRoleMap: {},
    shareWith: [
      {
        workspaceMemberId: MEMBER_ID,
        accessLevel: RecordShareAccessLevel.FULL,
      },
    ],
    transactionScope,
  };
  const user = {
    type: 'user',
    workspace: { id: WORKSPACE_ID },
    workspaceMemberId: MEMBER_ID,
  } as WorkspaceAuthContext;

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(getWorkspaceContext)
      .mockReturnValue({ recordPermissionContext: {} } as ReturnType<
        typeof getWorkspaceContext
      >);
    allowed.mockResolvedValue([RECORD_ID]);
  });

  it.each(['user', 'apiKey'] as const)(
    'rejects %s delegation when one required action is missing',
    async (type) => {
      allowed.mockImplementation(async ({ action }) =>
        action === 'destroy' ? [] : [RECORD_ID],
      );
      await expect(
        service.insertRecordSharesForCreatedRecords({
          ...input,
          authContext: { ...user, type } as WorkspaceAuthContext,
        }),
      ).rejects.toThrow('Cannot delegate access');
      expect(storage.insertMany).not.toHaveBeenCalled();
    },
  );

  it('removes grants from a previously destroyed record before checking the reused id', async () => {
    let oldGrantExists = true;
    storage.deleteByRecordIds.mockImplementation(async () => {
      oldGrantExists = false;
    });
    allowed.mockImplementation(async () => (oldGrantExists ? [RECORD_ID] : []));
    await expect(
      service.insertRecordSharesForCreatedRecords({
        ...input,
        authContext: user,
      }),
    ).rejects.toThrow('Cannot delegate access');
    expect(storage.insertMany).not.toHaveBeenCalled();
  });

  it('checks the delegation level and retains only explicit grants', async () => {
    await service.insertRecordSharesForCreatedRecords({
      ...input,
      authContext: user,
    });
    expect(allowed).toHaveBeenCalledWith({
      recordIds: [RECORD_ID],
      action: 'share',
      delegatedAccessLevel: RecordShareAccessLevel.FULL,
    });
    expect(storage.insertMany).toHaveBeenCalledWith(
      expect.objectContaining({
        recordShares: [
          expect.objectContaining({
            recordId: RECORD_ID,
            principalId: MEMBER_ID,
            rowCause: RecordShareRowCause.MANUAL,
          }),
        ],
      }),
    );
    expect(
      principals.assertPrincipalsReachRecordsOrThrow,
    ).not.toHaveBeenCalled();
  });

  it('keeps explicit application grants and their provenance without implicit ownership', async () => {
    await service.insertRecordSharesForCreatedRecords({
      ...input,
      authContext: {
        type: 'application',
        workspace: { id: WORKSPACE_ID },
        application: { id: MEMBER_ID, defaultRoleId: RECORD_ID },
      } as unknown as WorkspaceAuthContext,
    });
    expect(allowed).not.toHaveBeenCalled();
    expect(storage.insertMany).toHaveBeenCalledWith(
      expect.objectContaining({
        recordShares: [
          expect.objectContaining({
            rowCause: RecordShareRowCause.APPLICATION,
            sourceId: MEMBER_ID,
          }),
        ],
      }),
    );
  });
});
