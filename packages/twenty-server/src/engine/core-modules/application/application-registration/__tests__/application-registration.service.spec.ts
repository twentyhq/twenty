import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationRegistrationService } from '../application-registration.service';
import { ApplicationRegistrationEntity } from '../application-registration.entity';
import { ApplicationRegistrationSourceType } from '../enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';

describe('ApplicationRegistrationService', () => {
  let service: ApplicationRegistrationService;
  let repository: jest.Mocked<Repository<ApplicationRegistrationEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {},
        },
        {
          provide: ApplicationRegistrationVariableService,
          useValue: {
            syncVariableSchemas: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApplicationRegistrationService>(
      ApplicationRegistrationService,
    );
    repository = module.get(getRepositoryToken(ApplicationRegistrationEntity));
  });

  describe('unlistOrphanedRegistrations', () => {
    it('should unlist registrations not in the active UIDs list', async () => {
      const mockUpdateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };

      repository.createQueryBuilder.mockReturnValue(
        mockUpdateQueryBuilder as any,
      );

      const activeUids = ['uuid1', 'uuid2'];

      await service.unlistOrphanedRegistrations(activeUids);

      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(mockUpdateQueryBuilder.update).toHaveBeenCalled();
      expect(mockUpdateQueryBuilder.set).toHaveBeenCalledWith({
        isListed: false,
      });
      expect(mockUpdateQueryBuilder.where).toHaveBeenCalledWith(
        'sourceType = :sourceType',
        { sourceType: ApplicationRegistrationSourceType.NPM },
      );
      expect(mockUpdateQueryBuilder.andWhere).toHaveBeenCalledWith(
        'isListed = true',
      );
      expect(mockUpdateQueryBuilder.andWhere).toHaveBeenCalledWith(
        'universalIdentifier NOT IN (:...activeUids)',
        { activeUids },
      );
    });

    it('should use a dummy UUID when activeUids is empty', async () => {
      const mockUpdateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };

      repository.createQueryBuilder.mockReturnValue(
        mockUpdateQueryBuilder as any,
      );

      await service.unlistOrphanedRegistrations([]);

      expect(mockUpdateQueryBuilder.andWhere).toHaveBeenCalledWith(
        'universalIdentifier NOT IN (:...activeUids)',
        { activeUids: ['00000000-0000-0000-0000-000000000000'] },
      );
    });
  });

  describe('upsertFromCatalog', () => {
    it('should set isListed to true when updating an existing registration', async () => {
      const existing = {
        id: '1',
        universalIdentifier: 'uuid1',
        isListed: false,
      };

      repository.findOne.mockResolvedValue(existing as any);

      await service.upsertFromCatalog({
        universalIdentifier: 'uuid1',
        name: 'test',
        sourceType: ApplicationRegistrationSourceType.NPM,
        sourcePackage: 'pkg',
        latestAvailableVersion: '1.0.0',
        manifest: {} as any,
      });

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          isListed: true,
        }),
      );
    });
  });
});
