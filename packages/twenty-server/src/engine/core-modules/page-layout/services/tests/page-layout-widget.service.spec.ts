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
import { PageLayoutPermissionService } from 'src/engine/core-modules/page-layout/services/page-layout-permission.service';

describe('PageLayoutWidgetService', () => {
  let pageLayoutWidgetService: PageLayoutWidgetService;
  let pageLayoutWidgetRepository: Repository<PageLayoutWidgetEntity>;
  let pageLayoutTabService: PageLayoutTabService;
  let pageLayoutPermissionService: PageLayoutPermissionService;

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
            insert: jest.fn(),
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
        {
          provide: PageLayoutPermissionService,
          useValue: {
            getUserPermissions: jest.fn(),
            applyPermissionsToLayouts: jest.fn(),
            applyPermissionsToTabs: jest.fn(),
            applyPermissionsToWidgets: jest.fn(),
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
    pageLayoutPermissionService = module.get<PageLayoutPermissionService>(
      PageLayoutPermissionService,
    );
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
      id: 'page-layout-widget-id',
      title: 'New Widget',
      pageLayoutTabId: 'page-layout-tab-id',
      gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
      type: WidgetType.VIEW,
    };

    it('should create a new page layout widget successfully', async () => {
      const workspaceId = 'workspace-id';

      jest.spyOn(pageLayoutWidgetRepository, 'insert').mockResolvedValue({
        identifiers: [{ id: 'page-layout-widget-id' }],
        generatedMaps: [],
        raw: [],
      });
      jest
        .spyOn(pageLayoutWidgetService, 'findByIdOrThrow')
        .mockResolvedValue(mockPageLayoutWidget);

      const result = await pageLayoutWidgetService.create(
        validPageLayoutWidgetData,
        workspaceId,
      );

      expect(pageLayoutWidgetRepository.insert).toHaveBeenCalledWith({
        ...validPageLayoutWidgetData,
        workspaceId,
      });
      expect(result).toEqual(mockPageLayoutWidget);
    });

    it('should throw an exception when title is not provided', async () => {
      const workspaceId = 'workspace-id';
      const pageLayoutWidgetData = {
        ...validPageLayoutWidgetData,
        title: undefined,
      };

      await expect(
        // @ts-expect-error - we are testing the exception
        pageLayoutWidgetService.create(pageLayoutWidgetData, workspaceId),
      ).rejects.toThrow(PageLayoutWidgetException);
      await expect(
        // @ts-expect-error - we are testing the exception
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
        // @ts-expect-error - we are testing the exception
        pageLayoutWidgetService.create(pageLayoutWidgetData, workspaceId),
      ).rejects.toThrow(PageLayoutWidgetException);
      await expect(
        // @ts-expect-error - we are testing the exception
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
        // @ts-expect-error - we are testing the exception
        pageLayoutWidgetService.create(pageLayoutWidgetData, workspaceId),
      ).rejects.toThrow(PageLayoutWidgetException);
      await expect(
        // @ts-expect-error - we are testing the exception
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
        undefined,
      );
    });
  });

  describe('Permission-aware methods', () => {
    const userWorkspaceId = 'user-workspace-id';
    const roleId = 'role-id';
    const objectWithPermission = 'object-with-permission';
    const objectWithoutPermission = 'object-without-permission';

    const mockPermissionGranted = {
      canRead: true,
      canUpdate: true,
      canSoftDelete: true,
      canDestroy: false,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: false,
      restrictedFields: {},
    };

    const mockPermissionDenied = {
      canRead: false,
      canUpdate: false,
      canSoftDelete: false,
      canDestroy: false,
      canReadObjectRecords: false,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
      restrictedFields: {},
    };

    const mockPermissionsWithAccess = {
      version: '1',
      data: {
        [roleId]: {
          [objectWithPermission]: mockPermissionGranted,
        },
      },
    };

    const mockPermissionsWithoutAccess = {
      version: '1',
      data: {
        [roleId]: {
          [objectWithoutPermission]: mockPermissionDenied,
        },
      },
    };

    const mockPermissionsMixed = {
      version: '1',
      data: {
        [roleId]: {
          [objectWithPermission]: mockPermissionGranted,
          [objectWithoutPermission]: mockPermissionDenied,
        },
      },
    };

    const mockEmptyPermissions = {
      version: '1',
      data: {
        [roleId]: {},
      },
    };

    describe('findByPageLayoutTabIdWithPermissions', () => {
      it('should return widgets with canReadWidget false when user has no role', async () => {
        const workspaceId = 'workspace-id';
        const pageLayoutTabId = 'page-layout-tab-id';
        const widgets = [
          { ...mockPageLayoutWidget, objectMetadataId: objectWithPermission },
          {
            ...mockPageLayoutWidget,
            id: 'widget-2',
            objectMetadataId: objectWithoutPermission,
          },
        ];

        jest
          .spyOn(pageLayoutWidgetRepository, 'find')
          .mockResolvedValue(widgets);
        jest
          .spyOn(pageLayoutPermissionService, 'getUserPermissions')
          .mockResolvedValue({});

        const result =
          await pageLayoutWidgetService.findByPageLayoutTabIdWithPermissions(
            workspaceId,
            pageLayoutTabId,
            userWorkspaceId,
          );

        expect(result).toHaveLength(2);
        expect(result[0].canReadWidget).toBe(false);
        expect(result[0].configuration).toBe(null);
        expect(result[1].canReadWidget).toBe(false);
        expect(result[1].configuration).toBe(null);
      });

      it('should return widgets with mixed permissions based on user role', async () => {
        const workspaceId = 'workspace-id';
        const pageLayoutTabId = 'page-layout-tab-id';
        const widgets = [
          {
            ...mockPageLayoutWidget,
            objectMetadataId: objectWithPermission,
            configuration: { data: 'config1' },
          },
          {
            ...mockPageLayoutWidget,
            id: 'widget-2',
            objectMetadataId: objectWithoutPermission,
            configuration: { data: 'config2' },
          },
          {
            ...mockPageLayoutWidget,
            id: 'widget-3',
            objectMetadataId: null,
            configuration: { data: 'config3' },
          },
        ];

        jest
          .spyOn(pageLayoutWidgetRepository, 'find')
          .mockResolvedValue(widgets);
        jest
          .spyOn(pageLayoutPermissionService, 'getUserPermissions')
          .mockResolvedValue(mockPermissionsMixed.data[roleId]);

        const result =
          await pageLayoutWidgetService.findByPageLayoutTabIdWithPermissions(
            workspaceId,
            pageLayoutTabId,
            userWorkspaceId,
          );

        expect(result).toHaveLength(3);
        expect(result[0].canReadWidget).toBe(true);
        expect(result[0].configuration).toEqual({ data: 'config1' });
        expect(result[1].canReadWidget).toBe(false);
        expect(result[1].configuration).toBe(null);
        expect(result[2].canReadWidget).toBe(true);
        expect(result[2].configuration).toEqual({ data: 'config3' });
      });
    });

    describe('findByIdOrThrowWithPermissions', () => {
      it('should return widget with permission when user has access', async () => {
        const id = 'page-layout-widget-id';
        const workspaceId = 'workspace-id';
        const widget = {
          ...mockPageLayoutWidget,
          objectMetadataId: objectWithPermission,
          configuration: { test: 'data' },
        };

        jest
          .spyOn(pageLayoutWidgetRepository, 'findOne')
          .mockResolvedValue(widget);
        jest
          .spyOn(pageLayoutPermissionService, 'getUserPermissions')
          .mockResolvedValue(mockPermissionsWithAccess.data[roleId]);

        const result =
          await pageLayoutWidgetService.findByIdOrThrowWithPermissions(
            id,
            workspaceId,
            userWorkspaceId,
          );

        expect(result.canReadWidget).toBe(true);
        expect(result.configuration).toEqual({ test: 'data' });
      });

      it('should return widget without configuration when user lacks access', async () => {
        const id = 'page-layout-widget-id';
        const workspaceId = 'workspace-id';
        const widget = {
          ...mockPageLayoutWidget,
          objectMetadataId: objectWithoutPermission,
          configuration: { test: 'data' },
        };

        jest
          .spyOn(pageLayoutWidgetRepository, 'findOne')
          .mockResolvedValue(widget);
        jest
          .spyOn(pageLayoutPermissionService, 'getUserPermissions')
          .mockResolvedValue(mockPermissionsWithoutAccess.data[roleId]);

        const result =
          await pageLayoutWidgetService.findByIdOrThrowWithPermissions(
            id,
            workspaceId,
            userWorkspaceId,
          );

        expect(result.canReadWidget).toBe(false);
        expect(result.configuration).toBe(null);
      });

      it('should allow access to widget without objectMetadataId', async () => {
        const id = 'page-layout-widget-id';
        const workspaceId = 'workspace-id';
        const widget = {
          ...mockPageLayoutWidget,
          objectMetadataId: null,
          configuration: { test: 'data' },
        };

        jest
          .spyOn(pageLayoutWidgetRepository, 'findOne')
          .mockResolvedValue(widget);
        jest
          .spyOn(pageLayoutPermissionService, 'getUserPermissions')
          .mockResolvedValue(mockEmptyPermissions.data[roleId]);

        const result =
          await pageLayoutWidgetService.findByIdOrThrowWithPermissions(
            id,
            workspaceId,
            userWorkspaceId,
          );

        expect(result.canReadWidget).toBe(true);
        expect(result.configuration).toEqual({ test: 'data' });
      });
    });

    describe('createWithPermissions', () => {
      const validWidgetData = {
        title: 'New Widget',
        pageLayoutTabId: 'page-layout-tab-id',
        gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
        type: WidgetType.VIEW,
      };

      it('should create widget without objectMetadataId successfully', async () => {
        const workspaceId = 'workspace-id';
        const widgetData = { ...validWidgetData, objectMetadataId: null };

        jest.spyOn(pageLayoutWidgetRepository, 'insert').mockResolvedValue({
          identifiers: [{ id: 'new-widget-id' }],
          generatedMaps: [],
          raw: [],
        });
        jest.spyOn(pageLayoutWidgetRepository, 'findOne').mockResolvedValue({
          ...mockPageLayoutWidget,
          id: 'new-widget-id',
          objectMetadataId: null,
        });
        jest
          .spyOn(pageLayoutPermissionService, 'getUserPermissions')
          .mockResolvedValue(mockEmptyPermissions.data[roleId]);

        const result = await pageLayoutWidgetService.createWithPermissions(
          widgetData,
          workspaceId,
          userWorkspaceId,
        );

        expect(result.id).toBe('new-widget-id');
        expect(result.canReadWidget).toBe(true);
        expect(pageLayoutWidgetRepository.insert).toHaveBeenCalled();
      });

      it('should create widget with objectMetadataId when user has permission', async () => {
        const workspaceId = 'workspace-id';
        const widgetData = {
          ...validWidgetData,
          objectMetadataId: objectWithPermission,
        };

        jest.spyOn(pageLayoutWidgetRepository, 'insert').mockResolvedValue({
          identifiers: [{ id: 'new-widget-id' }],
          generatedMaps: [],
          raw: [],
        });
        jest.spyOn(pageLayoutWidgetRepository, 'findOne').mockResolvedValue({
          ...mockPageLayoutWidget,
          id: 'new-widget-id',
          objectMetadataId: objectWithPermission,
        });
        jest
          .spyOn(pageLayoutPermissionService, 'getUserPermissions')
          .mockResolvedValue(mockPermissionsWithAccess.data[roleId]);

        const result = await pageLayoutWidgetService.createWithPermissions(
          widgetData,
          workspaceId,
          userWorkspaceId,
        );

        expect(result.id).toBe('new-widget-id');
        expect(result.canReadWidget).toBe(true);
        expect(pageLayoutWidgetRepository.insert).toHaveBeenCalled();
      });

      it('should throw exception when creating widget with objectMetadataId user lacks permission for', async () => {
        const workspaceId = 'workspace-id';
        const widgetData = {
          ...validWidgetData,
          objectMetadataId: objectWithoutPermission,
        };

        jest
          .spyOn(pageLayoutPermissionService, 'getUserPermissions')
          .mockResolvedValue(mockPermissionsWithoutAccess.data[roleId]);

        await expect(
          pageLayoutWidgetService.createWithPermissions(
            widgetData,
            workspaceId,
            userWorkspaceId,
          ),
        ).rejects.toThrow(PageLayoutWidgetException);
        await expect(
          pageLayoutWidgetService.createWithPermissions(
            widgetData,
            workspaceId,
            userWorkspaceId,
          ),
        ).rejects.toHaveProperty(
          'code',
          PageLayoutWidgetExceptionCode.FORBIDDEN_OBJECT_METADATA_ACCESS,
        );

        expect(pageLayoutWidgetRepository.insert).not.toHaveBeenCalled();
      });
    });

    describe('updateWithPermissions', () => {
      it('should allow updating widget when user has permission for current objectMetadataId', async () => {
        const id = 'page-layout-widget-id';
        const workspaceId = 'workspace-id';
        const updateData = { title: 'Updated Title' };
        const existingWidget = {
          ...mockPageLayoutWidget,
          objectMetadataId: objectWithPermission,
        };

        jest
          .spyOn(pageLayoutWidgetRepository, 'findOne')
          .mockResolvedValueOnce(existingWidget)
          .mockResolvedValueOnce(existingWidget) // For update check
          .mockResolvedValueOnce({ ...existingWidget, title: 'Updated Title' }); // After update
        jest
          .spyOn(pageLayoutWidgetRepository, 'update')
          .mockResolvedValue({ affected: 1 } as any);
        jest
          .spyOn(pageLayoutPermissionService, 'getUserPermissions')
          .mockResolvedValue(mockPermissionsWithAccess.data[roleId]);

        const result = await pageLayoutWidgetService.updateWithPermissions(
          id,
          workspaceId,
          updateData,
          userWorkspaceId,
        );

        expect(result.title).toBe('Updated Title');
        expect(pageLayoutWidgetRepository.update).toHaveBeenCalledWith(
          { id },
          updateData,
        );
      });

      it('should throw exception when updating configuration without object permission', async () => {
        const id = 'page-layout-widget-id';
        const workspaceId = 'workspace-id';
        const updateData = { configuration: { new: 'config' } };
        const existingWidget = {
          ...mockPageLayoutWidget,
          objectMetadataId: objectWithoutPermission,
        };

        jest
          .spyOn(pageLayoutWidgetRepository, 'findOne')
          .mockResolvedValue(existingWidget);
        jest
          .spyOn(pageLayoutPermissionService, 'getUserPermissions')
          .mockResolvedValue(mockPermissionsWithoutAccess.data[roleId]);

        await expect(
          pageLayoutWidgetService.updateWithPermissions(
            id,
            workspaceId,
            updateData,
            userWorkspaceId,
          ),
        ).rejects.toThrow(PageLayoutWidgetException);
        await expect(
          pageLayoutWidgetService.updateWithPermissions(
            id,
            workspaceId,
            updateData,
            userWorkspaceId,
          ),
        ).rejects.toHaveProperty(
          'code',
          PageLayoutWidgetExceptionCode.FORBIDDEN_OBJECT_METADATA_ACCESS,
        );

        expect(pageLayoutWidgetRepository.update).not.toHaveBeenCalled();
      });

      it('should allow updating non-configuration fields without object permission', async () => {
        const id = 'page-layout-widget-id';
        const workspaceId = 'workspace-id';
        const updateData = {
          title: 'Updated Title',
          gridPosition: { row: 1, column: 1, rowSpan: 2, columnSpan: 2 },
        };
        const existingWidget = {
          ...mockPageLayoutWidget,
          objectMetadataId: objectWithoutPermission,
        };

        jest
          .spyOn(pageLayoutWidgetRepository, 'findOne')
          .mockResolvedValueOnce(existingWidget) // For permission check
          .mockResolvedValueOnce(existingWidget) // For update check
          .mockResolvedValueOnce({ ...existingWidget, ...updateData });
        jest
          .spyOn(pageLayoutWidgetRepository, 'update')
          .mockResolvedValue({ affected: 1 } as any);
        jest
          .spyOn(pageLayoutPermissionService, 'getUserPermissions')
          .mockResolvedValue(mockPermissionsWithoutAccess.data[roleId]);

        const result = await pageLayoutWidgetService.updateWithPermissions(
          id,
          workspaceId,
          updateData,
          userWorkspaceId,
        );

        expect(result.title).toBe('Updated Title');
        expect(pageLayoutWidgetRepository.update).toHaveBeenCalledWith(
          { id },
          updateData,
        );
      });

      it('should throw exception when changing objectMetadataId to one without permission', async () => {
        const id = 'page-layout-widget-id';
        const workspaceId = 'workspace-id';
        const updateData = { objectMetadataId: objectWithoutPermission };
        const existingWidget = {
          ...mockPageLayoutWidget,
          objectMetadataId: objectWithPermission,
        };

        jest
          .spyOn(pageLayoutWidgetRepository, 'findOne')
          .mockResolvedValue(existingWidget);
        jest
          .spyOn(pageLayoutPermissionService, 'getUserPermissions')
          .mockResolvedValue(mockPermissionsMixed.data[roleId]);

        await expect(
          pageLayoutWidgetService.updateWithPermissions(
            id,
            workspaceId,
            updateData,
            userWorkspaceId,
          ),
        ).rejects.toThrow(PageLayoutWidgetException);
        await expect(
          pageLayoutWidgetService.updateWithPermissions(
            id,
            workspaceId,
            updateData,
            userWorkspaceId,
          ),
        ).rejects.toHaveProperty(
          'code',
          PageLayoutWidgetExceptionCode.FORBIDDEN_OBJECT_METADATA_ACCESS,
        );

        expect(pageLayoutWidgetRepository.update).not.toHaveBeenCalled();
      });
    });

    describe('deleteWithPermissions', () => {
      it('should allow deleting widget regardless of object permissions', async () => {
        const id = 'page-layout-widget-id';
        const workspaceId = 'workspace-id';
        const widget = {
          ...mockPageLayoutWidget,
          objectMetadataId: objectWithoutPermission,
        };

        jest
          .spyOn(pageLayoutWidgetRepository, 'findOne')
          .mockResolvedValue(widget);
        jest
          .spyOn(pageLayoutWidgetRepository, 'softDelete')
          .mockResolvedValue({ affected: 1 } as any);
        jest
          .spyOn(pageLayoutPermissionService, 'getUserPermissions')
          .mockResolvedValue(mockPermissionsWithoutAccess.data[roleId]);

        const result = await pageLayoutWidgetService.deleteWithPermissions(
          id,
          workspaceId,
          userWorkspaceId,
        );

        expect(result.id).toBe(id);
        expect(result.canReadWidget).toBe(false);
        expect(result.configuration).toBe(null);
        expect(pageLayoutWidgetRepository.softDelete).toHaveBeenCalledWith(id);
      });
    });

    describe('restoreWithPermissions', () => {
      it('should allow restoring widget regardless of object permissions', async () => {
        const id = 'page-layout-widget-id';
        const workspaceId = 'workspace-id';
        const deletedWidget = {
          ...mockPageLayoutWidget,
          deletedAt: new Date(),
          objectMetadataId: objectWithoutPermission,
        };

        jest
          .spyOn(pageLayoutWidgetRepository, 'findOne')
          .mockResolvedValueOnce(deletedWidget) // For restore check
          .mockResolvedValueOnce({ ...deletedWidget, deletedAt: null }); // After restore
        jest
          .spyOn(pageLayoutWidgetRepository, 'restore')
          .mockResolvedValue({ affected: 1 } as any);
        jest
          .spyOn(pageLayoutPermissionService, 'getUserPermissions')
          .mockResolvedValue(mockPermissionsWithoutAccess.data[roleId]);

        const result = await pageLayoutWidgetService.restoreWithPermissions(
          id,
          workspaceId,
          userWorkspaceId,
        );

        expect(result.id).toBe(id);
        expect(result.canReadWidget).toBe(false);
        expect(result.configuration).toBe(null);
        expect(pageLayoutWidgetRepository.restore).toHaveBeenCalledWith(id);
      });
    });
  });
});
