import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { IsNull, type Repository, type UpdateResult } from 'typeorm';

import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';

describe('ApplicationAuthorizationService', () => {
  let service: ApplicationAuthorizationService;
  let repository: jest.Mocked<Repository<ApplicationAuthorizationEntity>>;

  const queryBuilder = {
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    orIgnore: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ identifiers: [] }),
  };

  const userId = 'user-1';
  const otherUserId = 'user-2';
  const workspaceId = 'workspace-1';
  const userWorkspaceId = 'user-workspace-1';
  const applicationId = 'application-1';
  const authorizationId = 'authorization-1';

  const buildUpdateResult = (affected: number): UpdateResult => ({
    affected,
    raw: [],
    generatedMaps: [],
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    queryBuilder.innerJoinAndSelect.mockReturnThis();
    queryBuilder.where.mockReturnThis();
    queryBuilder.andWhere.mockReturnThis();
    queryBuilder.orderBy.mockReturnThis();
    queryBuilder.getMany.mockResolvedValue([]);
    queryBuilder.insert.mockReturnThis();
    queryBuilder.values.mockReturnThis();
    queryBuilder.orIgnore.mockReturnThis();
    queryBuilder.execute.mockResolvedValue({ identifiers: [] });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationAuthorizationService,
        {
          provide: getRepositoryToken(ApplicationAuthorizationEntity),
          useValue: {
            upsert: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(() => queryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get(ApplicationAuthorizationService);
    repository = module.get(
      getRepositoryToken(ApplicationAuthorizationEntity),
    ) as jest.Mocked<Repository<ApplicationAuthorizationEntity>>;
  });

  describe('recordAuthorization', () => {
    it('should upsert on the user and application pair so re-authorizing does not duplicate the row', async () => {
      await service.recordAuthorization({
        userId,
        workspaceId,
        userWorkspaceId,
        applicationId,
        scopes: ['api', 'profile'],
      });

      expect(repository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          workspaceId,
          userWorkspaceId,
          applicationId,
          scopes: ['api', 'profile'],
        }),
        expect.objectContaining({
          conflictPaths: ['userId', 'applicationId'],
        }),
      );
    });

    it('should clear revokedAt when the user authorizes again', async () => {
      await service.recordAuthorization({
        userId,
        workspaceId,
        userWorkspaceId,
        applicationId,
        scopes: [],
      });

      expect(repository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ revokedAt: null }),
        expect.anything(),
      );
    });
  });

  describe('backfillAuthorizationFromRefreshToken', () => {
    const backfill = () =>
      service.backfillAuthorizationFromRefreshToken({
        userId,
        workspaceId,
        userWorkspaceId,
        applicationId,
      });

    it('should leave the consent unrecorded rather than guessing it', async () => {
      await backfill();

      expect(queryBuilder.values).toHaveBeenCalledWith(
        expect.objectContaining({ scopes: null, lastAuthorizedAt: null }),
      );
    });

    it('should never overwrite a row written by a real consent', async () => {
      await backfill();

      expect(queryBuilder.orIgnore).toHaveBeenCalled();
      expect(repository.upsert).not.toHaveBeenCalled();
    });
  });

  describe('findByUserAndApplication', () => {
    it('should not filter on revokedAt so callers can tell a revoked grant from a missing one', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await service.findByUserAndApplication({ userId, applicationId });

      expect(repository.findOneBy).toHaveBeenCalledWith({
        userId,
        applicationId,
      });
    });
  });

  describe('findActiveAuthorizationsForUser', () => {
    it('should only return unrevoked authorizations whose application still exists', async () => {
      await service.findActiveAuthorizationsForUser(userId);

      expect(queryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
        'applicationAuthorization.application',
        'application',
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'applicationAuthorization.userId = :userId',
        { userId },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'applicationAuthorization.revokedAt IS NULL',
      );
    });

    it('should put the most recently used authorization first', async () => {
      await service.findActiveAuthorizationsForUser(userId);

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'applicationAuthorization.lastUsedAt',
        'DESC',
      );
    });
  });

  describe('revokeAuthorizationById', () => {
    it('should scope the update by userId so an id from another user matches nothing', async () => {
      repository.update.mockResolvedValue(buildUpdateResult(0));

      const revoked = await service.revokeAuthorizationById({
        authorizationId,
        userId: otherUserId,
      });

      expect(repository.update).toHaveBeenCalledWith(
        { id: authorizationId, userId: otherUserId, revokedAt: IsNull() },
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
      expect(revoked).toBe(false);
    });

    it('should report true when the row was still active', async () => {
      repository.update.mockResolvedValue(buildUpdateResult(1));

      expect(
        await service.revokeAuthorizationById({ authorizationId, userId }),
      ).toBe(true);
    });

    it('should report false when the row was already revoked', async () => {
      repository.update.mockResolvedValue(buildUpdateResult(0));

      expect(
        await service.revokeAuthorizationById({ authorizationId, userId }),
      ).toBe(false);
    });
  });

  describe('revokeAuthorizationForApplication', () => {
    it('should revoke the live row for that user and application', async () => {
      repository.update.mockResolvedValue(buildUpdateResult(1));

      const revoked = await service.revokeAuthorizationForApplication({
        userId,
        applicationId,
      });

      expect(repository.update).toHaveBeenCalledWith(
        { userId, applicationId, revokedAt: IsNull() },
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
      expect(revoked).toBe(true);
    });
  });
});
