import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordPermissionExplanationService } from 'src/engine/core-modules/record-permission/services/record-permission-explanation.service';
import { createRecordPermissionTestContext } from 'src/engine/core-modules/record-permission/utils/__tests__/record-permission-test-context';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

jest.mock('src/engine/twenty-orm/storage/orm-workspace-context.storage');

describe('Access explanation authorization', () => {
  it.each(['read', 'share'])(
    'requires the caller to hold %s before reading another member or policy source',
    async (deniedAction) => {
      const { context, objects } = createRecordPermissionTestContext();
      jest
        .mocked(getWorkspaceContext)
        .mockReturnValue({ recordPermissionContext: context } as ReturnType<
          typeof getWorkspaceContext
        >);
      const executeRaw = jest.fn();
      const repository = {
        executeRaw,
        findRecordIdsAllowedForRecordPermissionAction: jest.fn(
          async ({ action }: { action: string }) =>
            action === deniedAction ? [] : ['record'],
        ),
      };
      const manager = {
        getRepositoryWithContextPermissions: () => repository,
        executeInWorkspaceContext: async (callback: () => Promise<unknown>) =>
          callback(),
      };
      const service = new RecordPermissionExplanationService(
        manager as unknown as WorkspaceOrmManager,
      );
      await expect(
        service.explain({
          authContext: {} as UserWorkspaceAuthContext,
          target: { objectMetadataId: objects.company.id, recordId: 'record' },
          workspaceMemberId: 'member',
          action: 'read',
        }),
      ).rejects.toThrow('Sharing permission is required');
      expect(executeRaw).not.toHaveBeenCalled();
    },
  );
});
