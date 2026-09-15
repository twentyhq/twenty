import { ForbiddenException } from '@nestjs/common';

import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordExportEntity } from 'src/engine/core-modules/record-export/record-export.entity';
import {
  RecordExportQueryWorkspaceService,
  type RecordExportQueryContext,
} from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('RecordExportQueryWorkspaceService', () => {
  const membership = {
    getWorkspaceMember: jest.fn(),
    getUserWorkspaceForUser: jest.fn(),
  };
  const permissions = { userHasWorkspaceSettingPermission: jest.fn() };
  const runner = { execute: jest.fn() };
  const requester = {
    type: 'user',
    workspace: { id: 'workspace' },
    userWorkspaceId: 'owner',
    workspaceMemberId: 'member',
  } as UserWorkspaceAuthContext;
  const service = new RecordExportQueryWorkspaceService(
    membership as unknown as UserWorkspaceService,
    permissions as unknown as PermissionsService,
    {} as WorkspaceCacheService,
    runner as unknown as CommonFindManyQueryRunnerService,
    {} as ApplicationTranslationCatalogService,
  );

  beforeEach(() => jest.resetAllMocks());

  it('denies exports after export permission is revoked', async () => {
    permissions.userHasWorkspaceSettingPermission.mockResolvedValue(false);
    await expect(service.assertCanExport(requester)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('does not accept system authentication as a replacement for the requester', async () => {
    await expect(
      service.assertCanExport({
        type: 'system',
        workspace: requester.workspace,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('denies exports when the requester has left the workspace', async () => {
    membership.getWorkspaceMember.mockResolvedValue(null);
    await expect(
      service.resolveRequester(
        Object.assign(new RecordExportEntity(), {
          workspaceId: 'workspace',
          workspaceMemberId: 'member',
        }),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('does not transfer an old export to a recreated membership', async () => {
    membership.getWorkspaceMember.mockResolvedValue({
      id: 'member',
      userId: 'user',
    });
    membership.getUserWorkspaceForUser.mockResolvedValue({
      id: 'new-membership',
    });
    await expect(
      service.resolveRequester(
        Object.assign(new RecordExportEntity(), {
          workspaceId: 'workspace',
          workspaceMemberId: 'member',
          userWorkspaceId: 'old-membership',
        }),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('reads each page through the permission-aware runner in the requester context', async () => {
    runner.execute.mockImplementation(async () => {
      expect(getWorkspaceAuthContext()).toBe(requester);
      return { results: { records: [] } };
    });
    const parameters = {
      objectMetadataId: 'person',
      fieldMetadataIds: ['name'],
      filter: { id: { in: ['selected-record'] } },
    };
    const context = {
      columns: [],
      queryRunnerContext: { authContext: requester },
      selectedFields: { edges: { node: { id: true } } },
    } as unknown as RecordExportQueryContext;
    await service.readPage(parameters, context, 'cursor', 500);
    expect(runner.execute).toHaveBeenCalledWith(
      {
        filter: parameters.filter,
        orderBy: undefined,
        selectedFields: context.selectedFields,
        first: 500,
        after: 'cursor',
      },
      context.queryRunnerContext,
    );
  });
});
