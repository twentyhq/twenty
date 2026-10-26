import { type DataSource } from 'typeorm';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { createRecordPermissionTestContext } from 'src/engine/core-modules/record-permission/utils/__tests__/record-permission-test-context';
import { loadRecordPermissionContextForAuthorities } from 'src/engine/core-modules/record-permission/utils/load-active-record-permission-context.util';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

jest.mock(
  'src/engine/core-modules/record-permission/utils/load-active-record-permission-context.util',
);

describe('Subscription permission authority freshness', () => {
  const prepare = () => {
    const { context, objects, rule } = createRecordPermissionTestContext();
    rule.condition = null;
    rule.actions = ['read'];
    jest
      .mocked(loadRecordPermissionContextForAuthorities)
      .mockResolvedValue(context);
    const evaluateSnapshots = jest.fn(async () => new Set(['record']));
    const manager = {
      executeInWorkspaceContext: async (callback: () => Promise<unknown>) =>
        callback(),
      getRepository: () => ({
        findRecordSnapshotIdsAdmittedByPermission: evaluateSnapshots,
      }),
    };
    const cache = {
      getOrRecompute: async () => ({
        flatObjectMetadataMaps: context.flatObjectMetadataMaps,
        flatFieldMetadataMapsOrm: context.flatFieldMetadataMaps,
        featureFlagsMap: {},
      }),
    };
    const service = new RecordAccessPolicyService(
      {} as DataSource,
      manager as unknown as WorkspaceOrmManager,
      cache as unknown as WorkspaceCacheService,
      {} as RecordShareStorageService,
    );
    const subject: RowAccessPolicySubject = {
      recordPermissionAuthorityIdentity: {
        type: 'user',
        workspace: { id: objects.company.workspaceId },
        userWorkspaceId: 'membership',
      },
      recordPermissionRoleIds: [context.authorities[0].roleId],
      isSystemContext: false,
      objectsPermissions: undefined,
      principalIds: [],
      canAccessAllRecords: false,
      isOwningApplication: () => false,
      resolveRowLevelPermissionRecordFilter: () => null,
    };
    const gate = service.buildEventRecordAccessGate({
      workspaceId: objects.company.workspaceId,
      objectMetadata: objects.company,
      name: 'company.created',
      events: [
        {
          recordId: 'record',
          properties: { after: { id: 'record' } },
        } as ObjectRecordEvent,
      ],
    });
    return { context, subject, gate, evaluateSnapshots };
  };

  beforeEach(() => jest.clearAllMocks());

  it('supplies the stable subscriber identity and evaluates snapshots when role assignments match', async () => {
    const { subject, gate } = prepare();
    expect(await gate.resolveAdmittedRecordIds(subject)).toEqual(
      new Set(['record']),
    );
    expect(loadRecordPermissionContextForAuthorities).toHaveBeenCalledWith(
      expect.objectContaining({
        authContext: subject.recordPermissionAuthorityIdentity,
      }),
    );
  });

  it('preserves explicit-role automation contexts without a member identity', async () => {
    const { subject, gate } = prepare();
    subject.recordPermissionAuthorityIdentity = undefined;
    expect(await gate.resolveAdmittedRecordIds(subject)).toEqual(
      new Set(['record']),
    );
  });

  it.each(['changedRole', 'removedAssignment'] as const)(
    'suppresses delivery for %s before cached field restrictions can be used',
    async (scenario) => {
      const { context, subject, gate, evaluateSnapshots } = prepare();
      if (scenario === 'changedRole')
        subject.recordPermissionRoleIds = ['old-role'];
      if (scenario === 'removedAssignment') context.denyAll = true;
      expect(await gate.resolveAdmittedRecordIds(subject)).toEqual(new Set());
      expect(evaluateSnapshots).not.toHaveBeenCalled();
    },
  );
});
