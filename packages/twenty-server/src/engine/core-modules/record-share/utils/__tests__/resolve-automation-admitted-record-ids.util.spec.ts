import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { type RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { resolveAutomationAdmittedRecordIds } from 'src/engine/core-modules/record-share/utils/resolve-automation-admitted-record-ids.util';
import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

const WORKSPACE_ID = 'workspace-1';
const STANDARD_APPLICATION_ID = 'standard-application-1';
const STANDARD_APPLICATION_ROLE_ID = 'standard-application-role-1';
const ADMITTED_RECORD_ID = 'record-1';

const payload = {
  workspaceId: WORKSPACE_ID,
} as WorkspaceEventBatch<ObjectRecordEvent>;

const buildWorkspaceCacheService = (
  standardApplicationDefaultRoleId: string | null,
) =>
  ({
    getOrRecompute: jest.fn().mockResolvedValue({
      flatApplicationMaps: {
        byId: {
          [STANDARD_APPLICATION_ID]: {
            id: STANDARD_APPLICATION_ID,
            defaultRoleId: standardApplicationDefaultRoleId,
            deletedAt: null,
          },
        },
        idByUniversalIdentifier: {
          [TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER]:
            STANDARD_APPLICATION_ID,
        },
      },
      rolesPermissions: {},
      roleIdsWithAllRecordsAccess: [],
      flatRowLevelPermissionPredicateMaps: {},
      flatRowLevelPermissionPredicateGroupMaps: {},
      flatFieldMetadataMaps: {},
      flatObjectMetadataMaps: {},
    }),
  }) as unknown as WorkspaceCacheService;

const buildRecordAccessPolicyService = () => {
  const resolveAdmittedRecordIds = jest.fn(
    async (_subject: RowAccessPolicySubject) =>
      new Set<string>([ADMITTED_RECORD_ID]),
  );

  const recordAccessPolicyService = {
    buildEventRecordAccessGate: jest.fn(() => ({ resolveAdmittedRecordIds })),
  } as unknown as RecordAccessPolicyService;

  return { recordAccessPolicyService, resolveAdmittedRecordIds };
};

describe('resolveAutomationAdmittedRecordIds', () => {
  it('should admit the records the standard application role can read', async () => {
    const { recordAccessPolicyService, resolveAdmittedRecordIds } =
      buildRecordAccessPolicyService();

    const admittedRecordIds = await resolveAutomationAdmittedRecordIds({
      payload,
      workspaceCacheService: buildWorkspaceCacheService(
        STANDARD_APPLICATION_ROLE_ID,
      ),
      recordAccessPolicyService,
    });

    expect(admittedRecordIds).toEqual(new Set([ADMITTED_RECORD_ID]));
    expect(resolveAdmittedRecordIds.mock.calls[0][0].principalIds).toContain(
      STANDARD_APPLICATION_ROLE_ID,
    );
  });

  it('should admit nothing when the standard application has no role', async () => {
    const { recordAccessPolicyService, resolveAdmittedRecordIds } =
      buildRecordAccessPolicyService();

    const admittedRecordIds = await resolveAutomationAdmittedRecordIds({
      payload,
      workspaceCacheService: buildWorkspaceCacheService(null),
      recordAccessPolicyService,
    });

    expect(admittedRecordIds).toEqual(new Set());
    expect(resolveAdmittedRecordIds).not.toHaveBeenCalled();
  });
});
