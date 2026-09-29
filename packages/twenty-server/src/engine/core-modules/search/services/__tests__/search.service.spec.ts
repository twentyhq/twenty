import { Test, type TestingModule } from '@nestjs/testing';

import { type ObjectRecord } from 'twenty-shared/types';

import { SearchService } from 'src/engine/core-modules/search/services/search.service';
import { formatSearchTerms } from 'src/engine/core-modules/search/utils/format-search-terms';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

describe('SearchService fallback', () => {
  let module: TestingModule;
  let service: SearchService;
  let fullTextSearch: jest.SpiedFunction<
    SearchService['buildSearchQueryAndGetRecords']
  >;

  const workspaceOrmManager = {
    runInWorkspaceTransaction: jest.fn(),
  };
  const fallbackRecords = [{ id: 'fallback-record', tsRankCD: 0, tsRank: 0 }];
  const flatObjectMetadata = getFlatObjectMetadataMock({
    universalIdentifier: '20202020-0000-4000-8000-000000000001',
    nameSingular: 'person',
  });

  const search = (searchInput: string, after?: string) =>
    service.buildSearchQueryAndGetRecordsWithFallback({
      entityManager: {} as WorkspaceRepository<ObjectRecord>,
      flatObjectMetadata,
      flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
      searchInput,
      searchTerms: formatSearchTerms(searchInput, 'and'),
      searchTermsOr: formatSearchTerms(searchInput, 'or'),
      limit: 30,
      filter: {},
      after,
    });

  beforeEach(async () => {
    workspaceOrmManager.runInWorkspaceTransaction.mockResolvedValue(
      fallbackRecords,
    );
    module = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: WorkspaceOrmManager, useValue: workspaceOrmManager },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn().mockReturnValue(2000) },
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get(SearchService);
    fullTextSearch = jest
      .spyOn(service, 'buildSearchQueryAndGetRecords')
      .mockResolvedValue([]);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await module.close();
  });

  it.each([
    'bignardi',
    'nardi',
    'café',
    '12345',
    '🙂',
    'Привет',
    'مرحبا',
    '',
    '   ',
  ])(
    'does not open a fallback transaction for a non-CJK miss: %s',
    async (searchInput) => {
      await expect(search(searchInput)).resolves.toEqual([]);

      expect(fullTextSearch).toHaveBeenCalledTimes(1);
      expect(
        workspaceOrmManager.runInWorkspaceTransaction,
      ).not.toHaveBeenCalled();
    },
  );

  it.each([
    '商业',
    'ひらがな',
    'カタカナ',
    '한국어',
    'Acme 商业',
    'Acmeカタカナ',
    '𠀀',
    'ｶﾀｶﾅ',
    '한',
  ])('retains the fallback for a CJK miss: %s', async (searchInput) => {
    await expect(search(searchInput)).resolves.toEqual(fallbackRecords);

    expect(fullTextSearch).toHaveBeenCalledTimes(1);
    expect(workspaceOrmManager.runInWorkspaceTransaction).toHaveBeenCalledTimes(
      1,
    );
  });

  it.each(['bignardi', '商业'])(
    'returns full-text matches without a fallback: %s',
    async (searchInput) => {
      const fullTextRecords = [
        { id: 'full-text-record', tsRankCD: 0.1, tsRank: 0.1 },
      ];

      fullTextSearch.mockResolvedValue(fullTextRecords);

      await expect(search(searchInput)).resolves.toEqual(fullTextRecords);
      expect(
        workspaceOrmManager.runInWorkspaceTransaction,
      ).not.toHaveBeenCalled();
    },
  );

  it('does not run the CJK fallback on subsequent pages', async () => {
    await expect(search('商业', 'cursor')).resolves.toEqual([]);

    expect(
      workspaceOrmManager.runInWorkspaceTransaction,
    ).not.toHaveBeenCalled();
  });
});
