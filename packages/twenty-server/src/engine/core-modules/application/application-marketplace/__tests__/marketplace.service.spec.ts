import { Test, type TestingModule } from '@nestjs/testing';

import axios from 'axios';

import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/marketplace.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

jest.mock('axios');

const mockedAxiosGet = axios.get as jest.Mock;

const buildSearchObjects = (count: number, offset: number) =>
  Array.from({ length: count }, (_, index) => ({
    package: {
      name: `twenty-app-${offset + index}`,
      version: '1.0.0',
      description: `Description ${offset + index}`,
      author: { name: 'Author' },
      links: { homepage: `https://example.com/${offset + index}` },
    },
  }));

describe('MarketplaceService', () => {
  let service: MarketplaceService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceService,
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn().mockReturnValue('https://registry.test') },
        },
      ],
    }).compile();

    service = module.get(MarketplaceService);
  });

  describe('fetchAppsFromRegistry', () => {
    it('returns all packages from a single partial page', async () => {
      mockedAxiosGet.mockResolvedValueOnce({
        data: { objects: buildSearchObjects(3, 0), total: 3 },
      });

      const packages = await service.fetchAppsFromRegistry();

      expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
      expect(mockedAxiosGet).toHaveBeenCalledWith(
        'https://registry.test/-/v1/search?text=keywords:twenty-app&size=250&from=0',
        expect.any(Object),
      );
      expect(packages).toHaveLength(3);
      expect(packages[0]).toEqual({
        name: 'twenty-app-0',
        version: '1.0.0',
        description: 'Description 0',
        author: 'Author',
        websiteUrl: 'https://example.com/0',
      });
    });

    it('paginates until every package is fetched', async () => {
      mockedAxiosGet
        .mockResolvedValueOnce({
          data: { objects: buildSearchObjects(250, 0), total: 550 },
        })
        .mockResolvedValueOnce({
          data: { objects: buildSearchObjects(250, 250), total: 550 },
        })
        .mockResolvedValueOnce({
          data: { objects: buildSearchObjects(50, 500), total: 550 },
        });

      const packages = await service.fetchAppsFromRegistry();

      expect(mockedAxiosGet).toHaveBeenCalledTimes(3);
      expect(mockedAxiosGet).toHaveBeenNthCalledWith(
        2,
        'https://registry.test/-/v1/search?text=keywords:twenty-app&size=250&from=250',
        expect.any(Object),
      );
      expect(mockedAxiosGet).toHaveBeenNthCalledWith(
        3,
        'https://registry.test/-/v1/search?text=keywords:twenty-app&size=250&from=500',
        expect.any(Object),
      );
      expect(packages).toHaveLength(550);
    });

    it('stops on total even when the last page is full', async () => {
      mockedAxiosGet
        .mockResolvedValueOnce({
          data: { objects: buildSearchObjects(250, 0), total: 500 },
        })
        .mockResolvedValueOnce({
          data: { objects: buildSearchObjects(250, 250), total: 500 },
        });

      const packages = await service.fetchAppsFromRegistry();

      expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
      expect(packages).toHaveLength(500);
    });

    it('deduplicates packages shifting between pages', async () => {
      mockedAxiosGet
        .mockResolvedValueOnce({
          data: { objects: buildSearchObjects(250, 0), total: 251 },
        })
        .mockResolvedValueOnce({
          data: { objects: buildSearchObjects(2, 249), total: 251 },
        });

      const packages = await service.fetchAppsFromRegistry();

      expect(packages).toHaveLength(251);
    });

    it('returns the packages fetched before a page fails', async () => {
      mockedAxiosGet
        .mockResolvedValueOnce({
          data: { objects: buildSearchObjects(250, 0), total: 300 },
        })
        .mockRejectedValueOnce(new Error('network error'));

      const packages = await service.fetchAppsFromRegistry();

      expect(packages).toHaveLength(250);
    });

    it('returns an empty list when the first request fails', async () => {
      mockedAxiosGet.mockRejectedValueOnce(new Error('network error'));

      const packages = await service.fetchAppsFromRegistry();

      expect(packages).toEqual([]);
    });

    it('returns an empty list on an unexpected response shape', async () => {
      mockedAxiosGet.mockResolvedValueOnce({ data: { unexpected: true } });

      const packages = await service.fetchAppsFromRegistry();

      expect(packages).toEqual([]);
    });
  });
});
