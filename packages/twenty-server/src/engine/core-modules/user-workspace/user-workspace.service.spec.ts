import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApprovedAccessDomainService } from 'src/engine/core-modules/approved-access-domain/services/approved-access-domain.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { RoleAssignmentValidationService } from 'src/engine/metadata-modules/role-assignment-validation/services/role-assignment-validation.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('UserWorkspaceService.updateDefaultFromHandle', () => {
  const userWorkspaceId = 'user-workspace-id';
  const workspaceId = 'workspace-id';

  let service: UserWorkspaceService;
  const userWorkspaceRepository = { update: jest.fn() };
  const connectedAccountMetadataService = { findUsableByCaller: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();

    connectedAccountMetadataService.findUsableByCaller.mockResolvedValue([
      {
        userWorkspaceId,
        handle: 'Me@Example.com',
        handleAliases: ['sales@example.com'],
      },
      {
        userWorkspaceId: 'someone-else',
        handle: 'shared@example.com',
        handleAliases: [],
      },
    ]);

    const module = await Test.createTestingModule({
      providers: [
        UserWorkspaceService,
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: userWorkspaceRepository,
        },
        { provide: getRepositoryToken(UserEntity), useValue: {} },
        {
          provide: ConnectedAccountMetadataService,
          useValue: connectedAccountMetadataService,
        },
        ...[
          getWorkspaceScopedRepositoryToken(RoleTargetEntity),
          RoleAssignmentValidationService,
          WorkspaceInvitationService,
          WorkspaceDomainsService,
          LoginTokenService,
          ApprovedAccessDomainService,
          WorkspaceOrmManager,
          UserRoleService,
          FileCorePictureService,
          FileUrlService,
          OnboardingService,
          CoreEntityCacheService,
          TwentyConfigService,
          WorkflowRunRecordShareService,
          WorkspaceCacheService,
        ].map((provide) => ({ provide, useValue: {} })),
      ],
    }).compile();

    service = module.get(UserWorkspaceService);
  });

  it('saves a sendable handle spelled as stored on the account', async () => {
    await service.updateDefaultFromHandle({
      userWorkspaceId,
      workspaceId,
      defaultFromHandle: 'me@example.com',
    });

    expect(userWorkspaceRepository.update).toHaveBeenCalledWith(
      { id: userWorkspaceId, workspaceId },
      { defaultFromHandle: 'Me@Example.com' },
    );
  });

  it('saves an alias of a connected account', async () => {
    await service.updateDefaultFromHandle({
      userWorkspaceId,
      workspaceId,
      defaultFromHandle: 'SALES@example.com',
    });

    expect(userWorkspaceRepository.update).toHaveBeenCalledWith(
      { id: userWorkspaceId, workspaceId },
      { defaultFromHandle: 'sales@example.com' },
    );
  });

  it('rejects a handle that is not sendable by the caller', async () => {
    await expect(
      service.updateDefaultFromHandle({
        userWorkspaceId,
        workspaceId,
        defaultFromHandle: 'shared@example.com',
      }),
    ).rejects.toMatchObject({
      constructor: PermissionsException,
      userFriendlyMessage: expect.objectContaining({
        message: 'You cannot send from this address.',
      }),
    });

    expect(userWorkspaceRepository.update).not.toHaveBeenCalled();
  });

  it('clears the handle when given null', async () => {
    await service.updateDefaultFromHandle({
      userWorkspaceId,
      workspaceId,
      defaultFromHandle: null,
    });

    expect(userWorkspaceRepository.update).toHaveBeenCalledWith(
      { id: userWorkspaceId, workspaceId },
      { defaultFromHandle: null },
    );
    expect(
      connectedAccountMetadataService.findUsableByCaller,
    ).not.toHaveBeenCalled();
  });
});
