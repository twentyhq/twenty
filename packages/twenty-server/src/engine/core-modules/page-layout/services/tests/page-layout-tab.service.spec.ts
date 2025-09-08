import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { type PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import {
  generatePageLayoutTabExceptionMessage,
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
  PageLayoutTabExceptionMessageKey,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-tab.exception';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout.exception';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';

describe('PageLayoutTabService', () => {
  let pageLayoutTabService: PageLayoutTabService;
  let pageLayoutTabRepository: Repository<PageLayoutTabEntity>;
  let pageLayoutService: PageLayoutService;

  const mockPageLayoutTab = {
    id: 'page-layout-tab-id',
    title: 'Test Tab',
    position: 0,
    pageLayoutId: 'page-layout-id',
    pageLayout: {} as any,
    workspaceId: 'workspace-id',
    workspace: {} as any,
    widgets: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as PageLayoutTabEntity;

  const mockWidget = {
    id: 'widget-1',
    title: 'Test Widget',
    type: WidgetType.VIEW,
    pageLayoutTabId: 'page-layout-tab-id',
    objectMetadataId: 'object-metadata-id',
    gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
    configuration: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as PageLayoutWidgetEntity;

  const mockPageLayout = {
    id: 'page-layout-id',
    workspaceId: 'workspace-id',
    title: 'Test Layout',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageLayoutTabService,
        {
          provide: getRepositoryToken(PageLayoutTabEntity),
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
          provide: PageLayoutService,
          useValue: {
            findByIdOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    pageLayoutTabService =
      module.get<PageLayoutTabService>(PageLayoutTabService);
    pageLayoutTabRepository = module.get<Repository<PageLayoutTabEntity>>(
      getRepositoryToken(PageLayoutTabEntity),
    );
    pageLayoutService = module.get<PageLayoutService>(PageLayoutService);
  });

  it('should be defined', () => {
    expect(pageLayoutTabService).toBeDefined();
  });

  describe('findByPageLayoutId', () => {
    it('should return page layout tabs for a page layout id', async () => {
      const workspaceId = 'workspace-id';
      const pageLayoutId = 'page-layout-id';
      const expectedTabs = [mockPageLayoutTab];

      jest
        .spyOn(pageLayoutTabRepository, 'find')
        .mockResolvedValue(expectedTabs);

      const result = await pageLayoutTabService.findByPageLayoutId(
        workspaceId,
        pageLayoutId,
      );

      expect(pageLayoutTabRepository.find).toHaveBeenCalledWith({
        where: {
          pageLayoutId,
          pageLayout: { workspaceId },
          deletedAt: expect.anything(),
        },
        order: { position: 'ASC' },
        relations: ['widgets'],
      });
      expect(result).toEqual(expectedTabs);
    });

    it('should return empty array when no tabs are found', async () => {
      const workspaceId = 'workspace-id';
      const pageLayoutId = 'page-layout-id';

      jest.spyOn(pageLayoutTabRepository, 'find').mockResolvedValue([]);

      const result = await pageLayoutTabService.findByPageLayoutId(
        workspaceId,
        pageLayoutId,
      );

      expect(result).toEqual([]);
    });

    it('should order tabs by position in ascending order', async () => {
      const workspaceId = 'workspace-id';
      const pageLayoutId = 'page-layout-id';
      const tab1 = { ...mockPageLayoutTab, id: 'tab-1', position: 2 };
      const tab2 = { ...mockPageLayoutTab, id: 'tab-2', position: 0 };
      const tab3 = { ...mockPageLayoutTab, id: 'tab-3', position: 1 };
      const expectedTabs = [tab2, tab3, tab1];

      jest
        .spyOn(pageLayoutTabRepository, 'find')
        .mockResolvedValue(expectedTabs);

      const result = await pageLayoutTabService.findByPageLayoutId(
        workspaceId,
        pageLayoutId,
      );

      expect(pageLayoutTabRepository.find).toHaveBeenCalledWith({
        where: {
          pageLayoutId,
          pageLayout: { workspaceId },
          deletedAt: expect.anything(),
        },
        order: { position: 'ASC' },
        relations: ['widgets'],
      });
      expect(result).toEqual(expectedTabs);
    });

    it('should include widgets relation', async () => {
      const workspaceId = 'workspace-id';
      const pageLayoutId = 'page-layout-id';
      const widget1 = { ...mockWidget, id: 'widget-1', type: WidgetType.VIEW };
      const widget2 = {
        ...mockWidget,
        id: 'widget-2',
        type: WidgetType.FIELDS,
      };
      const tabWithWidgets = {
        ...mockPageLayoutTab,
        widgets: [widget1, widget2],
      };

      jest
        .spyOn(pageLayoutTabRepository, 'find')
        .mockResolvedValue([tabWithWidgets]);

      const result = await pageLayoutTabService.findByPageLayoutId(
        workspaceId,
        pageLayoutId,
      );

      expect(result[0].widgets).toHaveLength(2);
      expect(result[0].widgets[0].id).toEqual('widget-1');
      expect(result[0].widgets[1].id).toEqual('widget-2');
    });
  });

  describe('findByIdOrThrow', () => {
    it('should return page layout tab when found', async () => {
      const id = 'page-layout-tab-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(pageLayoutTabRepository, 'findOne')
        .mockResolvedValue(mockPageLayoutTab);

      const result = await pageLayoutTabService.findByIdOrThrow(
        id,
        workspaceId,
      );

      expect(pageLayoutTabRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
          deletedAt: expect.anything(),
        },
        relations: ['widgets'],
      });
      expect(result).toEqual(mockPageLayoutTab);
    });

    it('should throw exception when page layout tab is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(pageLayoutTabRepository, 'findOne').mockResolvedValue(null);

      await expect(
        pageLayoutTabService.findByIdOrThrow(id, workspaceId),
      ).rejects.toThrow(PageLayoutTabException);
    });
  });

  describe('create', () => {
    it('should create a new page layout tab successfully', async () => {
      const workspaceId = 'workspace-id';
      const pageLayoutTabData = {
        title: 'New Tab',
        pageLayoutId: 'page-layout-id',
        position: 1,
      };

      jest
        .spyOn(pageLayoutService, 'findByIdOrThrow')
        .mockResolvedValue(mockPageLayout as any);
      jest
        .spyOn(pageLayoutTabRepository, 'create')
        .mockReturnValue(mockPageLayoutTab);
      jest
        .spyOn(pageLayoutTabRepository, 'save')
        .mockResolvedValue(mockPageLayoutTab);

      const result = await pageLayoutTabService.create(
        pageLayoutTabData,
        workspaceId,
      );

      expect(pageLayoutService.findByIdOrThrow).toHaveBeenCalledWith(
        pageLayoutTabData.pageLayoutId,
        workspaceId,
      );
      expect(pageLayoutTabRepository.create).toHaveBeenCalledWith({
        ...pageLayoutTabData,
        workspaceId,
      });
      expect(pageLayoutTabRepository.save).toHaveBeenCalledWith(
        mockPageLayoutTab,
      );
      expect(result).toEqual(mockPageLayoutTab);
    });

    it('should throw an exception when title is not provided', async () => {
      const workspaceId = 'workspace-id';
      const pageLayoutTabData = {
        pageLayoutId: 'page-layout-id',
      };

      await expect(
        pageLayoutTabService.create(pageLayoutTabData, workspaceId),
      ).rejects.toThrow(PageLayoutTabException);
      await expect(
        pageLayoutTabService.create(pageLayoutTabData, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    });

    it('should throw an exception when page layout does not exist', async () => {
      const workspaceId = 'workspace-id';
      const pageLayoutTabData = {
        title: 'New Tab',
        pageLayoutId: 'non-existent-page-layout-id',
      };

      jest
        .spyOn(pageLayoutService, 'findByIdOrThrow')
        .mockRejectedValue(
          new PageLayoutException(
            'Page layout not found',
            PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
          ),
        );

      await expect(
        pageLayoutTabService.create(pageLayoutTabData, workspaceId),
      ).rejects.toThrow(PageLayoutTabException);
      await expect(
        pageLayoutTabService.create(pageLayoutTabData, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    });

    it('should throw an exception when page layout is not found', async () => {
      const workspaceId = 'workspace-id';
      const pageLayoutTabData = {
        title: 'New Tab',
        pageLayoutId: 'non-existent-page-layout-id',
      };

      jest
        .spyOn(pageLayoutService, 'findByIdOrThrow')
        .mockRejectedValue(new Error('Page layout not found'));

      await expect(
        pageLayoutTabService.create(pageLayoutTabData, workspaceId),
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a page layout tab successfully', async () => {
      const id = 'page-layout-tab-id';
      const workspaceId = 'workspace-id';
      const updateData = { title: 'Updated Tab' };
      const updatedTab = { ...mockPageLayoutTab, title: 'Updated Tab' };

      jest
        .spyOn(pageLayoutTabRepository, 'findOne')
        .mockResolvedValue(mockPageLayoutTab);

      jest.spyOn(pageLayoutTabRepository, 'update').mockResolvedValue({
        affected: 1,
        generatedMaps: [],
        raw: {},
      });
      jest
        .spyOn(pageLayoutTabService, 'findByIdOrThrow')
        .mockResolvedValue(updatedTab);

      const result = await pageLayoutTabService.update(
        id,
        workspaceId,
        updateData,
      );

      expect(pageLayoutTabRepository.update).toHaveBeenCalledWith(
        { id },
        updateData,
      );
      expect(result).toEqual(updatedTab);
    });

    it('should throw an exception when tab to update is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';
      const updateData = { title: 'Updated Tab' };

      jest.spyOn(pageLayoutTabRepository, 'update').mockResolvedValue({
        affected: 1,
        generatedMaps: [],
        raw: {},
      });
      jest
        .spyOn(pageLayoutTabService, 'findByIdOrThrow')
        .mockRejectedValue(
          new PageLayoutTabException(
            'Page layout tab not found',
            PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
          ),
        );

      await expect(
        pageLayoutTabService.update(id, workspaceId, updateData),
      ).rejects.toThrow(PageLayoutTabException);
    });
  });

  describe('delete', () => {
    it('should soft delete a page layout tab successfully', async () => {
      const id = 'page-layout-tab-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(pageLayoutTabService, 'findByIdOrThrow')
        .mockResolvedValue(mockPageLayoutTab);
      jest
        .spyOn(pageLayoutTabRepository, 'softDelete')
        .mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

      const result = await pageLayoutTabService.delete(id, workspaceId);

      expect(pageLayoutTabRepository.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPageLayoutTab);
    });

    it('should throw an exception when tab to delete is not found', async () => {
      const id = 'non-existent-id';
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
        pageLayoutTabService.delete(id, workspaceId),
      ).rejects.toThrow(PageLayoutTabException);
    });
  });

  describe('destroy', () => {
    it('should permanently delete a page layout tab successfully', async () => {
      const id = 'page-layout-tab-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(pageLayoutTabRepository, 'findOne')
        .mockResolvedValue(mockPageLayoutTab);
      jest
        .spyOn(pageLayoutTabRepository, 'delete')
        .mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

      const result = await pageLayoutTabService.destroy(id, workspaceId);

      expect(pageLayoutTabRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
        },
        withDeleted: true,
      });
      expect(pageLayoutTabRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toBe(true);
    });

    it('should throw an exception when tab to destroy is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(pageLayoutTabRepository, 'findOne').mockResolvedValue(null);

      await expect(
        pageLayoutTabService.destroy(id, workspaceId),
      ).rejects.toThrow(PageLayoutTabException);
      await expect(
        pageLayoutTabService.destroy(id, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
    });
  });

  describe('restore', () => {
    it('should restore a deleted page layout tab successfully', async () => {
      const id = 'page-layout-tab-id';
      const workspaceId = 'workspace-id';
      const deletedTab = { ...mockPageLayoutTab, deletedAt: new Date() };

      jest
        .spyOn(pageLayoutTabRepository, 'findOne')
        .mockResolvedValue(deletedTab);
      jest
        .spyOn(pageLayoutTabRepository, 'restore')
        .mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });
      jest
        .spyOn(pageLayoutTabService, 'findByIdOrThrow')
        .mockResolvedValue(mockPageLayoutTab);

      const result = await pageLayoutTabService.restore(id, workspaceId);

      expect(pageLayoutTabRepository.findOne).toHaveBeenCalledWith({
        select: {
          id: true,
          deletedAt: true,
          pageLayoutId: true,
        },
        where: {
          id,
          workspaceId,
        },
        withDeleted: true,
      });
      expect(pageLayoutTabRepository.restore).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPageLayoutTab);
    });

    it('should throw an exception when tab to restore is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(pageLayoutTabRepository, 'findOne').mockResolvedValue(null);

      await expect(
        pageLayoutTabService.restore(id, workspaceId),
      ).rejects.toThrow(PageLayoutTabException);
      await expect(
        pageLayoutTabService.restore(id, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
      );
    });

    it('should throw an exception when tab is not deleted', async () => {
      const id = 'page-layout-tab-id';
      const workspaceId = 'workspace-id';
      const notDeletedTab = { ...mockPageLayoutTab, deletedAt: null };

      jest
        .spyOn(pageLayoutTabRepository, 'findOne')
        .mockResolvedValue(notDeletedTab);

      await expect(
        pageLayoutTabService.restore(id, workspaceId),
      ).rejects.toThrow(PageLayoutTabException);
      await expect(
        pageLayoutTabService.restore(id, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
    });

    it('should throw an exception when parent page layout is not accessible', async () => {
      const id = 'page-layout-tab-id';
      const workspaceId = 'workspace-id';
      const deletedTab = {
        ...mockPageLayoutTab,
        deletedAt: new Date(),
        pageLayoutId: 'deleted-page-layout-id',
      };

      jest
        .spyOn(pageLayoutTabRepository, 'findOne')
        .mockResolvedValue(deletedTab);
      jest
        .spyOn(pageLayoutService, 'findByIdOrThrow')
        .mockRejectedValue(
          new PageLayoutException(
            'Page layout not found',
            PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
          ),
        );

      await expect(
        pageLayoutTabService.restore(id, workspaceId),
      ).rejects.toThrow(PageLayoutTabException);
      await expect(
        pageLayoutTabService.restore(id, workspaceId),
      ).rejects.toHaveProperty(
        'code',
        PageLayoutTabExceptionCode.INVALID_PAGE_LAYOUT_TAB_DATA,
      );
      await expect(
        pageLayoutTabService.restore(id, workspaceId),
      ).rejects.toHaveProperty(
        'message',
        generatePageLayoutTabExceptionMessage(
          PageLayoutTabExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND,
        ),
      );

      expect(pageLayoutService.findByIdOrThrow).toHaveBeenCalledWith(
        'deleted-page-layout-id',
        workspaceId,
      );
    });
  });
});
