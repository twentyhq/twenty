import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { IsNull, type Repository } from 'typeorm';

import { PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import {
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-tab.exception';
import {
  generatePageLayoutWidgetExceptionMessage,
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-widget.exception';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutWidgetService } from 'src/engine/core-modules/page-layout/services/page-layout-widget.service';

describe('PageLayoutWidgetService', () => {
  let pageLayoutWidgetService: PageLayoutWidgetService;
  let pageLayoutWidgetRepository: Repository<PageLayoutWidgetEntity>;
  let pageLayoutTabService: PageLayoutTabService;

  const mockPageLayoutWidget = {
    id: 'page-layout-widget-id',
    title: 'Test Widget',
    type: WidgetType.VIEW,
    pageLayoutTabId: 'page-layout-tab-id',
    pageLayoutTab: {} as any,
    objectMetadataId: 'object-metadata-id',
    objectMetadata: null,
    gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
    configuration: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as PageLayoutWidgetEntity;

  const mockPageLayoutTab = {
    id: 'page-layout-tab-id',
    title: 'Test Tab',
    position: 0,
    pageLayoutId: 'page-layout-id',
    pageLayout: { workspaceId: 'workspace-id' },
    widgets: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageLayoutWidgetService,
        {
          provide: getRepositoryToken(PageLayoutWidgetEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
            restore: jest.fn(),
          },
        },
        {
          provide: PageLayoutTabService,
          useValue: {
            findByIdOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    pageLayoutWidgetService = module.get<PageLayoutWidgetService>(
      PageLayoutWidgetService,
    );
    pageLayoutWidgetRepository = module.get<Repository<PageLayoutWidgetEntity>>(
      getRepositoryToken(PageLayoutWidgetEntity),
    );
    pageLayoutTabService =
      module.get<PageLayoutTabService>(PageLayoutTabService);
  });

  it('should be defined', () => {
    expect(pageLayoutWidgetService).toBeDefined();
  });

  describe('findByPageLayoutTabId', () => {
    it('should return page layout widgets for a page layout tab id', async () => {
      const workspaceId = 'workspace-id';
      const pageLayoutTabId = 'page-layout-tab-id';
      const expectedWidgets = [mockPageLayoutWidget];

      jest
        .spyOn(pageLayoutWidgetRepository, 'find')
        .mockResolvedValue(expectedWidgets);

      const result = await pageLayoutWidgetService.findByPageLayoutTabId(
        workspaceId,
        pageLayoutTabId,
      );

      expect(pageLayoutWidgetRepository.find).toHaveBeenCalledWith({
        where: {
          pageLayoutTabId,
          workspaceId,
          deletedAt: IsNull(),
        },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(expectedWidgets);
    });

    it('should return empty array when no widgets are found', async () => {
      const workspaceId = 'workspace-id';
      const pageLayoutTabId = 'page-layout-tab-id';

      jest.spyOn(pageLayoutWidgetRepository, 'find').mockResolvedValue([]);

      const result = await pageLayoutWidgetService.findByPageLayoutTabId(
        workspaceId,
        pageLayoutTabId,
      );

      expect(result).toEqual([]);
    });
  });

  describe('findByIdOrThrow', () => {
    it('should return page layout widget when found', async () => {
      const id = 'page-layout-widget-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(pageLayoutWidgetRepository, 'findOne')
        .mockResolvedValue(mockPageLayoutWidget);

      const result = await pageLayoutWidgetService.findByIdOrThrow(
        id,
        workspaceId,
      );

      expect(pageLayoutWidgetRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
          deletedAt: IsNull(),
        },
      });
      expect(result).toEqual(mockPageLayoutWidget);
    });

    it('should throw exception when page layout widget is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(pageLayoutWidgetRepository, 'findOne').mockResolvedValue(null);

      await expect(
        pageLayoutWidgetService.findByIdOrThrow(id, workspaceId),
      ).rejects.toThrow(PageLayoutWidgetException);
      await expect(
        pageLayoutWidgetService.findByIdOrThrow(id, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    });
  });

  describe('create', () => {
    const validPageLayoutWidgetData = {
      title: 'New Widget',
      pageLayoutTabId: 'page-layout-tab-id',
      gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
      type: WidgetType.VIEW,
    };

    it('should create a new page layout widget successfully', async () => {
      const workspaceId = 'workspace-id';

      jest
        .spyOn(pageLayoutTabService, 'findByIdOrThrow')
        .mockResolvedValue(mockPageLayoutTab as any);
      jest
        .spyOn(pageLayoutWidgetRepository, 'create')
        .mockReturnValue(mockPageLayoutWidget);
      jest
        .spyOn(pageLayoutWidgetRepository, 'save')
        .mockResolvedValue(mockPageLayoutWidget);

      const result = await pageLayoutWidgetService.create(
        validPageLayoutWidgetData,
        workspaceId,
      );

      expect(pageLayoutTabService.findByIdOrThrow).toHaveBeenCalledWith(
        validPageLayoutWidgetData.pageLayoutTabId,
        workspaceId,
      );
      expect(pageLayoutWidgetRepository.create).toHaveBeenCalledWith({
        ...validPageLayoutWidgetData,
        workspaceId,
      });
      expect(pageLayoutWidgetRepository.save).toHaveBeenCalledWith(
        mockPageLayoutWidget,
      );
      expect(result).toEqual(mockPageLayoutWidget);
    });

    it('should throw an exception when title is not provided', async () => {
      const workspaceId = 'workspace-id';
      const pageLayoutWidgetData = {
        ...validPageLayoutWidgetData,
        title: undefined,
      };

      await expect(
        pageLayoutWidgetService.create(pageLayoutWidgetData, workspaceId),
      ).rejects.toThrow(PageLayoutWidgetException);
      await expect(
        pageLayoutWidgetService.create(pageLayoutWidgetData, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    });

    it('should throw an exception when pageLayoutTabId is not provided', async () => {
      const workspaceId = 'workspace-id';
      const pageLayoutWidgetData = {
        ...validPageLayoutWidgetData,
        pageLayoutTabId: undefined,
      };

      await expect(
        pageLayoutWidgetService.create(pageLayoutWidgetData, workspaceId),
      ).rejects.toThrow(PageLayoutWidgetException);
      await expect(
        pageLayoutWidgetService.create(pageLayoutWidgetData, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    });

    it('should throw an exception when gridPosition is not provided', async () => {
      const workspaceId = 'workspace-id';
      const pageLayoutWidgetData = {
        ...validPageLayoutWidgetData,
        gridPosition: undefined,
      };

      await expect(
        pageLayoutWidgetService.create(pageLayoutWidgetData, workspaceId),
      ).rejects.toThrow(PageLayoutWidgetException);
      await expect(
        pageLayoutWidgetService.create(pageLayoutWidgetData, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    });

    it('should throw an exception when page layout tab does not exist', async () => {
      const workspaceId = 'workspace-id';

      jest
        .spyOn(pageLayoutTabService, 'findByIdOrThrow')
        .mockRejectedValue(
          new PageLayoutTabException(
            'Page layout tab not found',
            PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
          ),
        );

      await expect(
        pageLayoutWidgetService.create(validPageLayoutWidgetData, workspaceId),
      ).rejects.toThrow(PageLayoutWidgetException);
      await expect(
        pageLayoutWidgetService.create(validPageLayoutWidgetData, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    });

    it('should rethrow other errors', async () => {
      const workspaceId = 'workspace-id';
      const unexpectedError = new Error('Unexpected error');

      jest
        .spyOn(pageLayoutTabService, 'findByIdOrThrow')
        .mockRejectedValue(unexpectedError);

      await expect(
        pageLayoutWidgetService.create(validPageLayoutWidgetData, workspaceId),
      ).rejects.toThrow(unexpectedError);
    });
  });

  describe('update', () => {
    it('should update a page layout widget successfully', async () => {
      const id = 'page-layout-widget-id';
      const workspaceId = 'workspace-id';
      const updateData = { title: 'Updated Widget' };
      const updatedWidget = {
        ...mockPageLayoutWidget,
        title: 'Updated Widget',
      };

      jest
        .spyOn(pageLayoutWidgetRepository, 'findOne')
        .mockResolvedValueOnce(mockPageLayoutWidget)
        .mockResolvedValueOnce(updatedWidget);
      jest.spyOn(pageLayoutWidgetRepository, 'update').mockResolvedValue({
        affected: 1,
        generatedMaps: [],
        raw: {},
      });

      const result = await pageLayoutWidgetService.update(
        id,
        workspaceId,
        updateData,
      );

      expect(pageLayoutWidgetRepository.findOne).toHaveBeenCalledTimes(2);
      expect(pageLayoutWidgetRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: {
          id,
          workspaceId,
          deletedAt: IsNull(),
        },
      });
      expect(pageLayoutWidgetRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: {
          id,
          workspaceId,
          deletedAt: IsNull(),
        },
      });
      expect(pageLayoutWidgetRepository.update).toHaveBeenCalledWith(
        { id },
        updateData,
      );
      expect(result).toEqual(updatedWidget);
    });

    it('should throw an exception when widget to update is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';
      const updateData = { title: 'Updated Widget' };

      jest.spyOn(pageLayoutWidgetRepository, 'findOne').mockResolvedValue(null);

      await expect(
        pageLayoutWidgetService.update(id, workspaceId, updateData),
      ).rejects.toThrow(PageLayoutWidgetException);
      await expect(
        pageLayoutWidgetService.update(id, workspaceId, updateData),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    });
  });

  describe('delete', () => {
    it('should soft delete a page layout widget successfully', async () => {
      const id = 'page-layout-widget-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(pageLayoutWidgetRepository, 'findOne')
        .mockResolvedValue(mockPageLayoutWidget);
      jest
        .spyOn(pageLayoutWidgetRepository, 'softDelete')
        .mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

      const result = await pageLayoutWidgetService.delete(id, workspaceId);

      expect(pageLayoutWidgetRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
          deletedAt: IsNull(),
        },
      });
      expect(pageLayoutWidgetRepository.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPageLayoutWidget);
    });

    it('should throw an exception when widget to delete is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(pageLayoutWidgetRepository, 'findOne').mockResolvedValue(null);

      await expect(
        pageLayoutWidgetService.delete(id, workspaceId),
      ).rejects.toThrow(PageLayoutWidgetException);
      await expect(
        pageLayoutWidgetService.delete(id, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    });
  });

  describe('destroy', () => {
    it('should permanently delete a page layout widget successfully', async () => {
      const id = 'page-layout-widget-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(pageLayoutWidgetRepository, 'findOne')
        .mockResolvedValue(mockPageLayoutWidget);
      jest
        .spyOn(pageLayoutWidgetRepository, 'delete')
        .mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

      const result = await pageLayoutWidgetService.destroy(id, workspaceId);

      expect(pageLayoutWidgetRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
        },
        withDeleted: true,
      });
      expect(pageLayoutWidgetRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toBe(true);
    });

    it('should throw an exception when widget to destroy is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(pageLayoutWidgetRepository, 'findOne').mockResolvedValue(null);

      await expect(
        pageLayoutWidgetService.destroy(id, workspaceId),
      ).rejects.toThrow(PageLayoutWidgetException);
      await expect(
        pageLayoutWidgetService.destroy(id, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    });
  });

  describe('restore', () => {
    it('should restore a deleted page layout widget successfully', async () => {
      const id = 'page-layout-widget-id';
      const workspaceId = 'workspace-id';
      const deletedWidget = { ...mockPageLayoutWidget, deletedAt: new Date() };

      jest
        .spyOn(pageLayoutWidgetRepository, 'findOne')
        .mockResolvedValueOnce(deletedWidget) // First call in restore method to check if deleted
        .mockResolvedValueOnce(mockPageLayoutWidget); // Second call in findByIdOrThrow
      jest
        .spyOn(pageLayoutWidgetRepository, 'restore')
        .mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

      const result = await pageLayoutWidgetService.restore(id, workspaceId);

      expect(pageLayoutWidgetRepository.findOne).toHaveBeenCalledTimes(2);
      expect(pageLayoutWidgetRepository.findOne).toHaveBeenNthCalledWith(1, {
        select: {
          id: true,
          deletedAt: true,
          pageLayoutTabId: true,
        },
        where: {
          id,
          workspaceId,
        },
        withDeleted: true,
      });
      expect(pageLayoutWidgetRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: {
          id,
          workspaceId,
          deletedAt: IsNull(),
        },
      });
      expect(pageLayoutWidgetRepository.restore).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPageLayoutWidget);
    });

    it('should throw an exception when widget to restore is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(pageLayoutWidgetRepository, 'findOne').mockResolvedValue(null);

      await expect(
        pageLayoutWidgetService.restore(id, workspaceId),
      ).rejects.toThrow(PageLayoutWidgetException);
      await expect(
        pageLayoutWidgetService.restore(id, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    });

    it('should throw an exception when widget is not deleted', async () => {
      const id = 'page-layout-widget-id';
      const workspaceId = 'workspace-id';
      const notDeletedWidget = { ...mockPageLayoutWidget, deletedAt: null };

      jest
        .spyOn(pageLayoutWidgetRepository, 'findOne')
        .mockResolvedValue(notDeletedWidget);

      await expect(
        pageLayoutWidgetService.restore(id, workspaceId),
      ).rejects.toThrow(PageLayoutWidgetException);
      await expect(
        pageLayoutWidgetService.restore(id, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    });

    it('should throw an exception when parent tab is not accessible', async () => {
      const id = 'page-layout-widget-id';
      const workspaceId = 'workspace-id';
      const deletedWidget = {
        ...mockPageLayoutWidget,
        deletedAt: new Date(),
        pageLayoutTabId: 'deleted-tab-id',
      };

      jest
        .spyOn(pageLayoutWidgetRepository, 'findOne')
        .mockResolvedValue(deletedWidget);
      jest
        .spyOn(pageLayoutTabService, 'findByIdOrThrow')
        .mockRejectedValue(
          new PageLayoutTabException(
            'Page layout tab not found',
            PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
          ),
        );

      await expect(
        pageLayoutWidgetService.restore(id, workspaceId),
      ).rejects.toThrow(PageLayoutWidgetException);
      await expect(
        pageLayoutWidgetService.restore(id, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
      await expect(
        pageLayoutWidgetService.restore(id, workspaceId),
      ).rejects.toHaveProperty(
        'message',
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
        ),
      );

      expect(pageLayoutTabService.findByIdOrThrow).toHaveBeenCalledWith(
        'deleted-tab-id',
        workspaceId,
      );
    });
  });
});
