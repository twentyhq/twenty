import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { type PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';

describe('PageLayoutTabService', () => {
  let pageLayoutTabService: PageLayoutTabService;
  let pageLayoutTabRepository: Repository<PageLayoutTabEntity>;

  const mockPageLayoutTab = {
    id: 'page-layout-tab-id',
    title: 'Test Tab',
    position: 0,
    pageLayoutId: 'page-layout-id',
    pageLayout: {} as any,
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

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageLayoutTabService,
        {
          provide: getRepositoryToken(PageLayoutTabEntity),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    pageLayoutTabService =
      module.get<PageLayoutTabService>(PageLayoutTabService);
    pageLayoutTabRepository = module.get<Repository<PageLayoutTabEntity>>(
      getRepositoryToken(PageLayoutTabEntity),
    );
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
});
