import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApprovedAccessDomainService } from 'src/engine/core-modules/approved-access-domain/services/approved-access-domain.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleValidationService } from 'src/engine/metadata-modules/role-validation/services/role-validation.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const USER_WORKSPACE_ID = '20202020-0000-4000-8000-000000000002';

describe('UserWorkspaceService.deleteUserWorkspace', () => {
  let service: UserWorkspaceService;
  let roleTargetRepository: { delete: jest.Mock; softDelete: jest.Mock };
  let userWorkspaceRepository: { delete: jest.Mock; softDelete: jest.Mock };

  beforeEach(async () => {
    roleTargetRepository = { delete: jest.fn(), softDelete: jest.fn() };
    userWorkspaceRepository = { delete: jest.fn(), softDelete: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserWorkspaceService,
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: userWorkspaceRepository,
        },
        { provide: getRepositoryToken(UserEntity), useValue: {} },
        {
          provide: getWorkspaceScopedRepositoryToken(RoleTargetEntity),
          useValue: roleTargetRepository,
        },
        { provide: RoleValidationService, useValue: {} },
        { provide: WorkspaceInvitationService, useValue: {} },
        { provide: WorkspaceDomainsService, useValue: {} },
        { provide: LoginTokenService, useValue: {} },
        { provide: ApprovedAccessDomainService, useValue: {} },
        { provide: GlobalWorkspaceOrmManager, useValue: {} },
        { provide: UserRoleService, useValue: {} },
        { provide: FileCorePictureService, useValue: {} },
        { provide: FileUrlService, useValue: {} },
        { provide: OnboardingService, useValue: {} },
        { provide: CoreEntityCacheService, useValue: {} },
      ],
    }).compile();

    service = module.get<UserWorkspaceService>(UserWorkspaceService);
  });

  it('hard deletes the role targets and the user workspace', async () => {
    await service.deleteUserWorkspace({
      userWorkspaceId: USER_WORKSPACE_ID,
      workspaceId: WORKSPACE_ID,
    });

    expect(roleTargetRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      userWorkspaceId: USER_WORKSPACE_ID,
    });
    expect(userWorkspaceRepository.delete).toHaveBeenCalledWith({
      id: USER_WORKSPACE_ID,
    });
  });

  // Criteria-based softDelete, not entity-based softRemove: the entity form
  // needs a primary key and throws on a partial like { userWorkspaceId }.
  it('soft deletes the role targets by criteria', async () => {
    await service.deleteUserWorkspace({
      userWorkspaceId: USER_WORKSPACE_ID,
      workspaceId: WORKSPACE_ID,
      softDelete: true,
    });

    expect(roleTargetRepository.softDelete).toHaveBeenCalledWith(WORKSPACE_ID, {
      userWorkspaceId: USER_WORKSPACE_ID,
    });
    expect(userWorkspaceRepository.softDelete).toHaveBeenCalledWith({
      id: USER_WORKSPACE_ID,
    });
    expect(roleTargetRepository.delete).not.toHaveBeenCalled();
  });
});
