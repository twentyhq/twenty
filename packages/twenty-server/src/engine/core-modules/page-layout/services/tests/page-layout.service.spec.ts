import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { IsNull, type Repository } from 'typeorm';

import { type CreatePageLayoutInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout.input';
import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
  PageLayoutExceptionMessageKey,
  generatePageLayoutExceptionMessage,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout.exception';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

describe('PageLayoutService', () => {
  let pageLayoutService: PageLayoutService;
  let pageLayoutRepository: Repository<PageLayoutEntity>;
  let twentyORMGlobalManager: TwentyORMGlobalManager;

  const mockPageLayout = {
    id: 'page-layout-id',
    name: 'Test Page Layout',
    workspaceId: 'workspace-id',
    type: PageLayoutType.RECORD_PAGE,
    objectMetadataId: 'object-metadata-id',
    tabs: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as unknown as PageLayoutEntity;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageLayoutService,
        {
          provide: getRepositoryToken(PageLayoutEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
            restore: jest.fn(),
            insert: jest.fn(),
          },
        },
        {
          provide: TwentyORMGlobalManager,
          useValue: {
            getRepositoryForWorkspace: jest.fn(),
          },
        },
      ],
    }).compile();

    pageLayoutService = module.get<PageLayoutService>(PageLayoutService);
    pageLayoutRepository = module.get<Repository<PageLayoutEntity>>(
      getRepositoryToken(PageLayoutEntity),
    );
    twentyORMGlobalManager = module.get<TwentyORMGlobalManager>(
      TwentyORMGlobalManager,
    );
  });

  describe('findByWorkspaceId', () => {
    it('should return page layouts for a workspace', async () => {
      const workspaceId = 'workspace-id';
      const expectedPageLayouts = [mockPageLayout];

      jest
        .spyOn(pageLayoutRepository, 'find')
        .mockResolvedValue(expectedPageLayouts);

      const result = await pageLayoutService.findByWorkspaceId(workspaceId);

      expect(pageLayoutRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          deletedAt: IsNull(),
        },
        relations: ['tabs', 'tabs.widgets'],
      });
      expect(result).toEqual(expectedPageLayouts);
    });
  });

  describe('findByObjectMetadataId', () => {
    it('should return page layouts for an object metadata id', async () => {
      const workspaceId = 'workspace-id';
      const objectMetadataId = 'object-metadata-id';
      const expectedPageLayouts = [mockPageLayout];

      jest
        .spyOn(pageLayoutRepository, 'find')
        .mockResolvedValue(expectedPageLayouts);

      const result = await pageLayoutService.findByObjectMetadataId(
        workspaceId,
        objectMetadataId,
      );

      expect(pageLayoutRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          objectMetadataId,
          deletedAt: IsNull(),
        },
        relations: ['tabs', 'tabs.widgets'],
      });
      expect(result).toEqual(expectedPageLayouts);
    });
  });

  describe('findByIdOrThrow', () => {
    it('should return a page layout by id', async () => {
      const id = 'page-layout-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(pageLayoutRepository, 'findOne')
        .mockResolvedValue(mockPageLayout);

      const result = await pageLayoutService.findByIdOrThrow(id, workspaceId);

      expect(pageLayoutRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
          deletedAt: IsNull(),
        },
        relations: ['tabs', 'tabs.widgets'],
      });
      expect(result).toEqual(mockPageLayout);
    });

    it('should throw exception when page layout is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(pageLayoutRepository, 'findOne').mockResolvedValue(null);

      await expect(
        pageLayoutService.findByIdOrThrow(id, workspaceId),
      ).rejects.toThrow(
        new PageLayoutException(
          generatePageLayoutExceptionMessage(
            PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
            id,
          ),
          PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
        ),
      );
    });
  });

  describe('create', () => {
    const validPageLayoutData = {
      id: 'page-layout-id',
      name: 'Test Page Layout',
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: 'object-metadata-id',
    };

    it('should create a page layout successfully', async () => {
      jest.spyOn(pageLayoutRepository, 'insert').mockResolvedValue({
        identifiers: [{ id: 'page-layout-id' }],
        generatedMaps: [],
        raw: [],
      });
      jest
        .spyOn(pageLayoutService, 'findByIdOrThrow')
        .mockResolvedValue(mockPageLayout);

      const result = await pageLayoutService.create(
        validPageLayoutData,
        'workspace-id',
      );

      expect(pageLayoutRepository.insert).toHaveBeenCalledWith({
        ...validPageLayoutData,
        workspaceId: 'workspace-id',
      });
      expect(result).toEqual(mockPageLayout);
    });

    it('should throw exception when name is missing', async () => {
      const invalidData = { ...validPageLayoutData, name: undefined };
      const workspaceId = 'workspace-id';

      await expect(
        pageLayoutService.create(
          invalidData as unknown as CreatePageLayoutInput,
          workspaceId,
        ),
      ).rejects.toThrow(
        new PageLayoutException(
          generatePageLayoutExceptionMessage(
            PageLayoutExceptionMessageKey.NAME_REQUIRED,
          ),
          PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        ),
      );
    });
  });

  describe('update', () => {
    it('should update a page layout successfully', async () => {
      const id = 'page-layout-id';
      const workspaceId = 'workspace-id';
      const updateData = { name: 'Updated Page Layout' };
      const updatedPageLayout = { ...mockPageLayout, ...updateData };

      jest.spyOn(pageLayoutRepository, 'update').mockResolvedValue({} as any);
      jest
        .spyOn(pageLayoutService, 'findByIdOrThrow')
        .mockResolvedValue(updatedPageLayout);

      const result = await pageLayoutService.update(
        id,
        workspaceId,
        updateData,
      );

      expect(pageLayoutRepository.update).toHaveBeenCalledWith(
        { id, workspaceId },
        updateData,
      );
      expect(pageLayoutService.findByIdOrThrow).toHaveBeenCalledWith(
        id,
        workspaceId,
        undefined,
      );
      expect(result).toEqual(updatedPageLayout);
    });

    it('should throw exception when page layout is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';
      const updateData = { name: 'Updated Page Layout' };

      jest
        .spyOn(pageLayoutService, 'findByIdOrThrow')
        .mockRejectedValue(
          new PageLayoutException(
            generatePageLayoutExceptionMessage(
              PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
              id,
            ),
            PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
          ),
        );

      await expect(
        pageLayoutService.update(id, workspaceId, updateData),
      ).rejects.toThrow(
        new PageLayoutException(
          generatePageLayoutExceptionMessage(
            PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
            id,
          ),
          PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
        ),
      );
    });
  });

  describe('delete', () => {
    it('should delete a page layout successfully', async () => {
      const id = 'page-layout-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(pageLayoutService, 'findByIdOrThrow')
        .mockResolvedValue(mockPageLayout);
      jest
        .spyOn(pageLayoutRepository, 'softDelete')
        .mockResolvedValue({} as any);

      const result = await pageLayoutService.delete(id, workspaceId);

      expect(pageLayoutService.findByIdOrThrow).toHaveBeenCalledWith(
        id,
        workspaceId,
        undefined,
      );
      expect(pageLayoutRepository.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPageLayout);
    });

    it('should throw exception when page layout is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(pageLayoutService, 'findByIdOrThrow')
        .mockRejectedValue(
          new PageLayoutException(
            generatePageLayoutExceptionMessage(
              PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
              id,
            ),
            PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
          ),
        );

      await expect(pageLayoutService.delete(id, workspaceId)).rejects.toThrow(
        new PageLayoutException(
          generatePageLayoutExceptionMessage(
            PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
            id,
          ),
          PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
        ),
      );
    });
  });

  describe('destroy', () => {
    it('should destroy a page layout successfully', async () => {
      const id = 'page-layout-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(pageLayoutRepository, 'findOne')
        .mockResolvedValue(mockPageLayout);
      jest.spyOn(pageLayoutRepository, 'delete').mockResolvedValue({} as any);

      const result = await pageLayoutService.destroy(id, workspaceId);

      expect(pageLayoutRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
        },
        withDeleted: true,
      });
      expect(pageLayoutRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPageLayout);
    });

    it('should throw exception when page layout is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(pageLayoutRepository, 'findOne')
        .mockRejectedValue(
          new PageLayoutException(
            generatePageLayoutExceptionMessage(
              PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
              id,
            ),
            PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
          ),
        );

      await expect(pageLayoutService.destroy(id, workspaceId)).rejects.toThrow(
        new PageLayoutException(
          generatePageLayoutExceptionMessage(
            PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
            id,
          ),
          PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
        ),
      );
    });

    it('should destroy associated dashboards when page layout is a dashboard', async () => {
      const id = 'page-layout-id';
      const workspaceId = 'workspace-id';
      const mockDashboardRepository = {
        find: jest.fn(),
        delete: jest.fn(),
      };
      const mockDashboards = [{ id: 'dashboard', pageLayoutId: id }];

      jest.spyOn(pageLayoutRepository, 'findOne').mockResolvedValue({
        ...mockPageLayout,
        type: PageLayoutType.DASHBOARD,
      });
      jest
        .spyOn(twentyORMGlobalManager, 'getRepositoryForWorkspace')
        .mockResolvedValue(mockDashboardRepository as any);
      jest
        .spyOn(mockDashboardRepository, 'find')
        .mockResolvedValue(mockDashboards);
      jest
        .spyOn(mockDashboardRepository, 'delete')
        .mockResolvedValue({} as any);
      jest.spyOn(pageLayoutRepository, 'delete').mockResolvedValue({} as any);

      const result = await pageLayoutService.destroy(id, workspaceId);

      expect(
        twentyORMGlobalManager.getRepositoryForWorkspace,
      ).toHaveBeenCalledWith(workspaceId, 'dashboard', {
        shouldBypassPermissionChecks: true,
      });
      expect(mockDashboardRepository.find).toHaveBeenCalledWith({
        where: {
          pageLayoutId: id,
        },
      });
      expect(mockDashboardRepository.delete).toHaveBeenCalledWith('dashboard');

      expect(pageLayoutRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        ...mockPageLayout,
        type: PageLayoutType.DASHBOARD,
      });
    });
  });

  describe('restore', () => {
    it('should restore a page layout successfully', async () => {
      const id = 'page-layout-id';
      const workspaceId = 'workspace-id';
      const deletedPageLayout = { ...mockPageLayout, deletedAt: new Date() };

      jest
        .spyOn(pageLayoutRepository, 'findOne')
        .mockResolvedValue(deletedPageLayout);
      jest.spyOn(pageLayoutRepository, 'restore').mockResolvedValue({} as any);
      jest
        .spyOn(pageLayoutService, 'findByIdOrThrow')
        .mockResolvedValue(mockPageLayout);

      const result = await pageLayoutService.restore(id, workspaceId);

      expect(pageLayoutRepository.findOne).toHaveBeenCalledWith({
        select: {
          id: true,
          deletedAt: true,
        },
        where: {
          id,
          workspaceId,
        },
        withDeleted: true,
      });
      expect(pageLayoutRepository.restore).toHaveBeenCalledWith(id);
      expect(pageLayoutService.findByIdOrThrow).toHaveBeenCalledWith(
        id,
        workspaceId,
      );
      expect(result).toEqual(mockPageLayout);
    });

    it('should throw exception when page layout is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(pageLayoutRepository, 'findOne').mockResolvedValue(null);

      await expect(pageLayoutService.restore(id, workspaceId)).rejects.toThrow(
        new PageLayoutException(
          generatePageLayoutExceptionMessage(
            PageLayoutExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
            id,
          ),
          PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
        ),
      );
    });
  });
});
