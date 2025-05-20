import { Test, TestingModule } from '@nestjs/testing';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { mockObjectMetadataItemsWithFieldMaps } from 'src/engine/core-modules/search/__mocks__/mockObjectMetadataItemsWithFieldMaps';
import { SearchService } from 'src/engine/core-modules/search/services/search.service';
import { encodeCursorData } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: TwentyORMManager, useValue: {} },
        { provide: WorkspaceCacheStorageService, useValue: {} },
        { provide: FileService, useValue: {} },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('filterObjectMetadataItems', () => {
    it('should return searchable object metadata items', () => {
      const objectMetadataItems = service.filterObjectMetadataItems({
        objectMetadataItemWithFieldMaps: mockObjectMetadataItemsWithFieldMaps,
        includedObjectNameSingulars: [],
        excludedObjectNameSingulars: [],
      });

      expect(objectMetadataItems).toEqual([
        mockObjectMetadataItemsWithFieldMaps[0],
        mockObjectMetadataItemsWithFieldMaps[1],
        mockObjectMetadataItemsWithFieldMaps[2],
      ]);
    });
    it('should return searchable object metadata items without excluded ones', () => {
      const objectMetadataItems = service.filterObjectMetadataItems({
        objectMetadataItemWithFieldMaps: mockObjectMetadataItemsWithFieldMaps,
        includedObjectNameSingulars: [],
        excludedObjectNameSingulars: ['company'],
      });

      expect(objectMetadataItems).toEqual([
        mockObjectMetadataItemsWithFieldMaps[0],
        mockObjectMetadataItemsWithFieldMaps[2],
      ]);
    });
    it('should return searchable object metadata items with included ones only', () => {
      const objectMetadataItems = service.filterObjectMetadataItems({
        objectMetadataItemWithFieldMaps: mockObjectMetadataItemsWithFieldMaps,
        includedObjectNameSingulars: ['company'],
        excludedObjectNameSingulars: [],
      });

      expect(objectMetadataItems).toEqual([
        mockObjectMetadataItemsWithFieldMaps[1],
      ]);
    });
  });

  describe('getLabelIdentifierColumns', () => {
    it('should return the two label identifier columns for a person object metadata item', () => {
      const labelIdentifierColumns = service.getLabelIdentifierColumns(
        mockObjectMetadataItemsWithFieldMaps[0],
      );

      expect(labelIdentifierColumns).toEqual(['nameFirstName', 'nameLastName']);
    });
    it('should return the label identifier column for a regular object metadata item', () => {
      const labelIdentifierColumns = service.getLabelIdentifierColumns(
        mockObjectMetadataItemsWithFieldMaps[1],
      );

      expect(labelIdentifierColumns).toEqual(['name']);
    });
  });

  describe('getImageIdentifierColumn', () => {
    it('should return null if the object metadata item does not have an image identifier', () => {
      const imageIdentifierColumn = service.getImageIdentifierColumn(
        mockObjectMetadataItemsWithFieldMaps[0],
      );

      expect(imageIdentifierColumn).toBeNull();
    });
    it('should return `domainNamePrimaryLinkUrl` column for a company object metadata item', () => {
      const imageIdentifierColumn = service.getImageIdentifierColumn(
        mockObjectMetadataItemsWithFieldMaps[1],
      );

      expect(imageIdentifierColumn).toEqual('domainNamePrimaryLinkUrl');
    });

    it('should return the image identifier column', () => {
      const imageIdentifierColumn = service.getImageIdentifierColumn(
        mockObjectMetadataItemsWithFieldMaps[2],
      );

      expect(imageIdentifierColumn).toEqual('imageIdentifierFieldName');
    });
  });

  describe('sortSearchObjectResults', () => {
    it('should sort the search object results by tsRankCD', () => {
      const objectResults = [
        {
          node: {
            objectNameSingular: 'person',
            tsRankCD: 2,
            tsRank: 1,
            recordId: '',
            label: '',
            imageUrl: '',
          },
        },
        {
          node: {
            objectNameSingular: 'company',
            tsRankCD: 1,
            tsRank: 1,
            recordId: '',
            label: '',
            imageUrl: '',
          },
        },
        {
          node: {
            objectNameSingular: 'regular-custom-object',
            tsRankCD: 3,
            tsRank: 1,
            recordId: '',
            label: '',
            imageUrl: '',
          },
        },
      ];

      expect(service.sortSearchObjectResults([...objectResults])).toEqual([
        objectResults[2],
        objectResults[0],
        objectResults[1],
      ]);
    });

    it('should sort the search object results by tsRank, if tsRankCD is the same', () => {
      const objectResults = [
        {
          node: {
            objectNameSingular: 'person',
            tsRankCD: 1,
            tsRank: 1,
            recordId: '',
            label: '',
            imageUrl: '',
          },
        },
        {
          node: {
            objectNameSingular: 'company',
            tsRankCD: 1,
            tsRank: 2,
            recordId: '',
            label: '',
            imageUrl: '',
          },
        },
        {
          node: {
            objectNameSingular: 'regular-custom-object',
            tsRankCD: 1,
            tsRank: 3,
            recordId: '',
            label: '',
            imageUrl: '',
          },
        },
      ];

      expect(service.sortSearchObjectResults([...objectResults])).toEqual([
        objectResults[2],
        objectResults[1],
        objectResults[0],
      ]);
    });

    it('should sort the search object results by priority rank, if tsRankCD and tsRank are the same', () => {
      const objectResults = [
        {
          node: {
            objectNameSingular: 'company',
            tsRankCD: 1,
            tsRank: 1,
            recordId: '',
            label: '',
            imageUrl: '',
          },
        },
        {
          node: {
            objectNameSingular: 'person',
            tsRankCD: 1,
            tsRank: 1,
            recordId: '',
            label: '',
            imageUrl: '',
          },
        },
        {
          node: {
            objectNameSingular: 'regular-custom-object',
            tsRankCD: 1,
            tsRank: 1,
            recordId: '',
            label: '',
            imageUrl: '',
          },
        },
      ];

      expect(service.sortSearchObjectResults([...objectResults])).toEqual([
        objectResults[1],
        objectResults[0],
        objectResults[2],
      ]);
    });
  });

  describe('computePageInfo', () => {
    it('should compute pageInfo properly', () => {
      const sortedSlicedRecords = [
        {
          node: {
            objectNameSingular: 'company',
            tsRankCD: 0.9,
            tsRank: 0.9,
            recordId: 'companyId1',
            label: '',
            imageUrl: '',
          },
        },
        {
          node: {
            objectNameSingular: 'company',
            tsRankCD: 0.89,
            tsRank: 0.89,
            recordId: 'companyId2',
            label: '',
            imageUrl: '',
          },
        },
        {
          node: {
            objectNameSingular: 'person',
            tsRankCD: 0.87,
            tsRank: 0.87,
            recordId: 'personId1',
            label: '',
            imageUrl: '',
          },
        },
        {
          node: {
            objectNameSingular: 'person',
            tsRankCD: 0.87,
            tsRank: 0.87,
            recordId: 'personId2',
            label: '',
            imageUrl: '',
          },
        },
        {
          node: {
            objectNameSingular: 'opportunity',
            tsRankCD: 0.87,
            tsRank: 0.87,
            recordId: 'opportunityId1',
            label: '',
            imageUrl: '',
          },
        },
        {
          node: {
            objectNameSingular: 'note',
            tsRankCD: 0.2,
            tsRank: 0.2,
            recordId: 'noteId1',
            label: '',
            imageUrl: '',
          },
        },
        {
          node: {
            objectNameSingular: 'company',
            tsRankCD: 0.1,
            tsRank: 0.1,
            recordId: 'companyId3',
            label: '',
            imageUrl: '',
          },
        },
      ];

      const expectedEndCursor = encodeCursorData({
        lastRanks: { tsRankCD: 0.87, tsRank: 0.87 },
        lastRecordIdsPerObject: {
          company: 'companyId2',
          person: 'personId2',
          opportunity: 'opportunityId1',
          note: null,
        },
      });

      expect(
        service.computeEndCursor({
          sortedRecords: [...sortedSlicedRecords],
          limit: 5,
        }),
      ).toEqual({ endCursor: expectedEndCursor, hasNextPage: true });
    });

    it('should compute pageInfo properly with one object', () => {
      const sortedSlicedRecords = [
        {
          node: {
            objectNameSingular: 'company',
            tsRankCD: 0.9,
            tsRank: 0.9,
            recordId: 'companyId1',
            label: '',
            imageUrl: '',
          },
        },
        {
          node: {
            objectNameSingular: 'company',
            tsRankCD: 0.89,
            tsRank: 0.89,
            recordId: 'companyId2',
            label: '',
            imageUrl: '',
          },
        },
        {
          node: {
            objectNameSingular: 'company',
            tsRankCD: 0.1,
            tsRank: 0.1,
            recordId: 'companyId3',
            label: '',
            imageUrl: '',
          },
        },
      ];

      const expectedEndCursor = encodeCursorData({
        lastRanks: { tsRankCD: 0.89, tsRank: 0.89 },
        lastRecordIdsPerObject: {
          company: 'companyId2',
        },
      });

      expect(
        service.computeEndCursor({
          sortedRecords: [...sortedSlicedRecords],
          limit: 2,
        }),
      ).toEqual({ endCursor: expectedEndCursor, hasNextPage: true });
    });
  });
});
