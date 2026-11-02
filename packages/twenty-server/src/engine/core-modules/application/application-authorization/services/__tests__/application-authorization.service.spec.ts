import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { In } from 'typeorm';

import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WellKnownOAuthClientInstallService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-install.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const USER_ID = 'user-id';
const USER_WORKSPACE_ID = 'user-workspace-id';
const SHARED_INSTALL_ID = 'shared-install-id';
const LEGACY_INSTALL_ID = 'legacy-install-id';

describe('ApplicationAuthorizationService', () => {
  let service: ApplicationAuthorizationService;

  const insertedRows: Record<string, unknown>[] = [];
  const queryBuilder = {
    insert: () => queryBuilder,
    values: (row: Record<string, unknown>) => {
      insertedRows.push(row);

      return queryBuilder;
    },
    orIgnore: () => queryBuilder,
    execute: jest.fn().mockResolvedValue(undefined),
  };
  const applicationAuthorizationRepository = {
    createQueryBuilder: () => queryBuilder,
    update: jest.fn(),
  };
  const userWorkspaceRepository = { findOne: jest.fn() };
  const applicationRepository = { find: jest.fn() };
  const wellKnownOAuthClientInstallService = {
    findFoldedApplicationIds: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    insertedRows.length = 0;

    wellKnownOAuthClientInstallService.findFoldedApplicationIds.mockResolvedValue(
      [SHARED_INSTALL_ID, LEGACY_INSTALL_ID],
    );
    applicationRepository.find.mockResolvedValue([
      { id: SHARED_INSTALL_ID },
      { id: LEGACY_INSTALL_ID },
    ]);
    applicationAuthorizationRepository.update.mockResolvedValue({
      affected: 2,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationAuthorizationService,
        {
          provide: getRepositoryToken(ApplicationAuthorizationEntity),
          useValue: applicationAuthorizationRepository,
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: userWorkspaceRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(ApplicationEntity),
          useValue: applicationRepository,
        },
        {
          provide: WellKnownOAuthClientInstallService,
          useValue: wellKnownOAuthClientInstallService,
        },
      ],
    }).compile();

    service = module.get(ApplicationAuthorizationService);
  });

  describe('revokeMemberAuthorizationsForWorkspaceApplication', () => {
    const revokeMember = () =>
      service.revokeMemberAuthorizationsForWorkspaceApplication({
        workspaceId: WORKSPACE_ID,
        applicationId: SHARED_INSTALL_ID,
        userId: USER_ID,
      });

    it('should lay down a row for every folded install before revoking, so a pre-table refresh token cannot backfill an active one', async () => {
      userWorkspaceRepository.findOne.mockResolvedValue({
        id: USER_WORKSPACE_ID,
      });

      expect(await revokeMember()).toBe(true);

      expect(applicationRepository.find).toHaveBeenCalledWith(WORKSPACE_ID, {
        select: { id: true },
        where: { id: In([SHARED_INSTALL_ID, LEGACY_INSTALL_ID]) },
      });
      expect(insertedRows).toEqual([
        expect.objectContaining({
          userId: USER_ID,
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: USER_WORKSPACE_ID,
          applicationId: SHARED_INSTALL_ID,
          revokedAt: null,
        }),
        expect.objectContaining({
          userId: USER_ID,
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: USER_WORKSPACE_ID,
          applicationId: LEGACY_INSTALL_ID,
          revokedAt: null,
        }),
      ]);

      const [backfillOrder] = queryBuilder.execute.mock.invocationCallOrder;
      const [revokeOrder] =
        applicationAuthorizationRepository.update.mock.invocationCallOrder;

      expect(backfillOrder).toBeLessThan(revokeOrder);
      expect(applicationAuthorizationRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: WORKSPACE_ID,
          userId: USER_ID,
          applicationId: In([SHARED_INSTALL_ID, LEGACY_INSTALL_ID]),
        }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });

    it('should skip the backfill for an application id that is not installed in the workspace', async () => {
      userWorkspaceRepository.findOne.mockResolvedValue({
        id: USER_WORKSPACE_ID,
      });
      applicationRepository.find.mockResolvedValue([]);

      await revokeMember();

      expect(insertedRows).toEqual([]);
      expect(applicationAuthorizationRepository.update).toHaveBeenCalled();
    });

    it('should skip the backfill when the user is no longer a member of the workspace', async () => {
      userWorkspaceRepository.findOne.mockResolvedValue(null);

      await revokeMember();

      expect(applicationRepository.find).not.toHaveBeenCalled();
      expect(insertedRows).toEqual([]);
      expect(applicationAuthorizationRepository.update).toHaveBeenCalled();
    });
  });

  describe('backfillAndRevokeMemberAuthorizations', () => {
    it('should lay down and revoke a row for only the given application id', async () => {
      userWorkspaceRepository.findOne.mockResolvedValue({
        id: USER_WORKSPACE_ID,
      });
      applicationRepository.find.mockResolvedValue([{ id: SHARED_INSTALL_ID }]);

      await service.backfillAndRevokeMemberAuthorizations({
        userId: USER_ID,
        workspaceId: WORKSPACE_ID,
        applicationIds: [SHARED_INSTALL_ID],
      });

      expect(
        wellKnownOAuthClientInstallService.findFoldedApplicationIds,
      ).not.toHaveBeenCalled();
      expect(insertedRows).toEqual([
        expect.objectContaining({ applicationId: SHARED_INSTALL_ID }),
      ]);
      expect(applicationAuthorizationRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: WORKSPACE_ID,
          userId: USER_ID,
          applicationId: In([SHARED_INSTALL_ID]),
        }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });
});
