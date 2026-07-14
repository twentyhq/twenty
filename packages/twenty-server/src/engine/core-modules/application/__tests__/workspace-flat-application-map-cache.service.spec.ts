import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceFlatApplicationMapCacheService } from 'src/engine/core-modules/application/workspace-flat-application-map-cache.service';

describe('WorkspaceFlatApplicationMapCacheService', () => {
  let service: WorkspaceFlatApplicationMapCacheService;

  const mockApplicationRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceFlatApplicationMapCacheService,
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: mockApplicationRepository,
        },
      ],
    }).compile();

    service = module.get<WorkspaceFlatApplicationMapCacheService>(
      WorkspaceFlatApplicationMapCacheService,
    );

    jest.clearAllMocks();
  });

  it('should index soft-deleted applications in byId but exclude them from idByUniversalIdentifier', async () => {
    mockApplicationRepository.find.mockResolvedValue([
      {
        id: 'deleted-app-id',
        universalIdentifier: 'shared-uid',
        deletedAt: new Date(),
      },
      {
        id: 'active-app-id',
        universalIdentifier: 'shared-uid',
        deletedAt: null,
      },
    ]);

    const result = await service.computeForCache('workspace-123');

    expect(result.byId['deleted-app-id']).toBeDefined();
    expect(result.byId['active-app-id']).toBeDefined();
    expect(result.idByUniversalIdentifier['shared-uid']).toBe('active-app-id');
  });

  it('should not resolve a universalIdentifier that only maps to soft-deleted applications', async () => {
    mockApplicationRepository.find.mockResolvedValue([
      {
        id: 'deleted-app-id',
        universalIdentifier: 'orphan-uid',
        deletedAt: new Date(),
      },
    ]);

    const result = await service.computeForCache('workspace-123');

    expect(result.byId['deleted-app-id']).toBeDefined();
    expect(result.idByUniversalIdentifier['orphan-uid']).toBeUndefined();
  });
});
