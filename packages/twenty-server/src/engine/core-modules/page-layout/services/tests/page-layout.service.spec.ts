import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { IsNull, type Repository } from 'typeorm';

import { PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
  PageLayoutExceptionMessageKey,
  generatePageLayoutExceptionMessage,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout.exception';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';

describe('PageLayoutService', () => {
  let pageLayoutService: PageLayoutService;
  let pageLayoutRepository: Repository<PageLayoutEntity>;

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
            softDelete: jest.fn(),
            delete: jest.fn(),
            restore: jest.fn(),
          },
        },
      ],
    }).compile();

    pageLayoutService = module.get<PageLayoutService>(PageLayoutService);
    pageLayoutRepository = module.get<Repository<PageLayoutEntity>>(
      getRepositoryToken(PageLayoutEntity),
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
        relations: ['tabs'],
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
        relations: ['tabs'],
      });
      expect(result).toEqual(expectedPageLayouts);
    });
  });

  describe('findById', () => {
    it('should return a page layout by id', async () => {
      const id = 'page-layout-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(pageLayoutRepository, 'findOne')
        .mockResolvedValue(mockPageLayout);

      const result = await pageLayoutService.findById(id, workspaceId);

      expect(pageLayoutRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
          deletedAt: IsNull(),
        },
        relations: ['tabs'],
      });
      expect(result).toEqual(mockPageLayout);
    });

    it('should return null when page layout is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(pageLayoutRepository, 'findOne').mockResolvedValue(null);

      const result = await pageLayoutService.findById(id, workspaceId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const validPageLayoutData = {
      name: 'Test Page Layout',
      workspaceId: 'workspace-id',
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: 'object-metadata-id',
    };

    it('should create a page layout successfully', async () => {
      jest
        .spyOn(pageLayoutRepository, 'create')
        .mockReturnValue(mockPageLayout);
      jest
        .spyOn(pageLayoutRepository, 'save')
        .mockResolvedValue(mockPageLayout);

      const result = await pageLayoutService.create(validPageLayoutData);

      expect(pageLayoutRepository.create).toHaveBeenCalledWith(
        validPageLayoutData,
      );
      expect(pageLayoutRepository.save).toHaveBeenCalledWith(mockPageLayout);
      expect(result).toEqual(mockPageLayout);
    });

    it('should throw exception when workspaceId is missing', async () => {
      const invalidData = { ...validPageLayoutData, workspaceId: undefined };

      await expect(pageLayoutService.create(invalidData)).rejects.toThrow(
        new PageLayoutException(
          generatePageLayoutExceptionMessage(
            PageLayoutExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
          PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
        ),
      );
    });

    it('should throw exception when name is missing', async () => {
      const invalidData = { ...validPageLayoutData, name: undefined };

      await expect(pageLayoutService.create(invalidData)).rejects.toThrow(
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

      jest
        .spyOn(pageLayoutService, 'findById')
        .mockResolvedValue(mockPageLayout);
      jest
        .spyOn(pageLayoutRepository, 'save')
        .mockResolvedValue(updatedPageLayout);

      const result = await pageLayoutService.update(
        id,
        workspaceId,
        updateData,
      );

      expect(pageLayoutService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(pageLayoutRepository.save).toHaveBeenCalledWith({
        ...mockPageLayout,
        ...updateData,
      });
      expect(result).toEqual(updatedPageLayout);
    });

    it('should throw exception when page layout is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';
      const updateData = { name: 'Updated Page Layout' };

      jest.spyOn(pageLayoutService, 'findById').mockResolvedValue(null);

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
        .spyOn(pageLayoutService, 'findById')
        .mockResolvedValue(mockPageLayout);
      jest
        .spyOn(pageLayoutRepository, 'softDelete')
        .mockResolvedValue({} as any);

      const result = await pageLayoutService.delete(id, workspaceId);

      expect(pageLayoutService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(pageLayoutRepository.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPageLayout);
    });

    it('should throw exception when page layout is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(pageLayoutService, 'findById').mockResolvedValue(null);

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
      expect(result).toEqual(true);
    });

    it('should throw exception when page layout is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(pageLayoutRepository, 'findOne').mockResolvedValue(null);

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
        .spyOn(pageLayoutService, 'findById')
        .mockResolvedValue(mockPageLayout);

      const result = await pageLayoutService.restore(id, workspaceId);

      expect(pageLayoutRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
        },
        withDeleted: true,
      });
      expect(pageLayoutRepository.restore).toHaveBeenCalledWith(id);
      expect(pageLayoutService.findById).toHaveBeenCalledWith(id, workspaceId);
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
