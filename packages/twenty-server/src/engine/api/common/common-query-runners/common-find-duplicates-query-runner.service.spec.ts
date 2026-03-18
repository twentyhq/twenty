import { FieldMetadataType } from 'twenty-shared/types';
import { type ObjectRecord } from 'twenty-shared/types';

import { CommonFindDuplicatesQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-duplicates-query-runner.service';
import { buildDuplicateConditions } from 'src/engine/api/utils/build-duplicate-conditions.utils';

jest.mock(
  'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select',
  () => ({
    buildColumnsToSelect: jest.fn(({ select }) => ({
      id: true,
      ...Object.fromEntries(
        Object.keys(select ?? {}).map((columnName) => [columnName, true]),
      ),
    })),
  }),
);

jest.mock('src/engine/api/utils/build-duplicate-conditions.utils', () => ({
  buildDuplicateConditions: jest.fn(),
  calculateNormalizedStringSimilarity: jest.requireActual(
    'src/engine/api/utils/build-duplicate-conditions.utils',
  ).calculateNormalizedStringSimilarity,
}));

const mockedBuildDuplicateConditions = jest.mocked(buildDuplicateConditions);

const createQueryBuilderMock = (records: Partial<ObjectRecord>[]) => {
  const queryBuilder = {
    setFindOptions: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(records),
    clone: jest.fn(),
    getCount: jest.fn().mockResolvedValue(records.length),
  };

  queryBuilder.clone.mockReturnValue({
    getCount: queryBuilder.getCount,
  });

  return queryBuilder;
};

const createBaseContext = (duplicateRecords: Partial<ObjectRecord>[]) => {
  const duplicateRecordsQueryBuilder = createQueryBuilderMock(duplicateRecords);

  return {
    queryRunnerContext: {
      repository: {
        createQueryBuilder: jest.fn().mockReturnValue(duplicateRecordsQueryBuilder),
      },
      flatObjectMetadata: {
        nameSingular: 'company',
        duplicateCriteria: [['name'], ['domainNamePrimaryLinkUrl']],
        fieldIds: ['field-domain-name'],
      },
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {},
        universalIdentifierById: {},
        universalIdentifiersByApplicationId: {},
      },
      flatFieldMetadataMaps: {
        byUniversalIdentifier: {
          domainName: {
            id: 'field-domain-name',
            universalIdentifier: 'field-domain-name',
            name: 'domainName',
            type: FieldMetadataType.LINKS,
          },
        },
        universalIdentifierById: {
          'field-domain-name': 'field-domain-name',
        },
        universalIdentifiersByApplicationId: {},
      },
      commonQueryParser: {
        applyFilterToBuilder: jest.fn(),
      },
    },
    duplicateRecordsQueryBuilder,
  };
};

describe('CommonFindDuplicatesQueryRunnerService', () => {
  beforeEach(() => {
    mockedBuildDuplicateConditions.mockReset();
  });

  it('returns name duplicates for an unsaved company payload with nested domain input', async () => {
    mockedBuildDuplicateConditions.mockImplementation((_objectMetadata, _objectMetadataMaps, _fieldMetadataMaps, records) => {
      const record = records?.[0];

      if (
        record?.name === 'Acme Corp' &&
        record?.domainNamePrimaryLinkUrl === 'acme.com'
      ) {
        return { or: [{ name: { eq: 'Acme Corp' } }] };
      }

      return {};
    });

    const service = new CommonFindDuplicatesQueryRunnerService();
    (service as never as { processNestedRelationsHelper: { processNestedRelations: jest.Mock } }).processNestedRelationsHelper =
      {
        processNestedRelations: jest.fn(),
      };
    const { queryRunnerContext } = createBaseContext([
      { id: 'existing-company', name: 'Acme Corp' },
    ]);

    const result = await service.run(
      {
        data: [
          {
            name: 'Acme Corp',
            domainName: { primaryLinkUrl: 'acme.com' },
          },
        ],
        selectedFieldsResult: {
          select: { name: true },
          relations: undefined as never,
          aggregate: {},
        },
      },
      queryRunnerContext as never,
    );

    expect(result[0].records).toEqual([
      { id: 'existing-company', name: 'Acme Corp' },
    ]);
    expect(mockedBuildDuplicateConditions).toHaveBeenCalledWith(
      queryRunnerContext.flatObjectMetadata,
      queryRunnerContext.flatObjectMetadataMaps,
      queryRunnerContext.flatFieldMetadataMaps,
      [
        expect.objectContaining({
          name: 'Acme Corp',
          domainNamePrimaryLinkUrl: 'acme.com',
        }),
      ],
      undefined,
    );
  });

  it('returns domain duplicates for an unsaved company payload with nested domain input only', async () => {
    mockedBuildDuplicateConditions.mockImplementation(
      (_objectMetadata, _objectMetadataMaps, _fieldMetadataMaps, records) => {
        const record = records?.[0];

        if (record?.domainNamePrimaryLinkUrl === 'acme.com') {
          return { or: [{ domainNamePrimaryLinkUrl: { eq: 'acme.com' } }] };
        }

        return {};
      },
    );

    const service = new CommonFindDuplicatesQueryRunnerService();
    (service as never as { processNestedRelationsHelper: { processNestedRelations: jest.Mock } }).processNestedRelationsHelper =
      {
        processNestedRelations: jest.fn(),
      };
    const { queryRunnerContext } = createBaseContext([
      {
        id: 'existing-company',
        domainNamePrimaryLinkUrl: 'acme.com',
      },
    ]);

    const result = await service.run(
      {
        data: [
          {
            domainName: { primaryLinkUrl: '  acme.com  ' },
          },
        ],
        selectedFieldsResult: {
          select: { domainNamePrimaryLinkUrl: true },
          relations: undefined as never,
          aggregate: {},
        },
      },
      queryRunnerContext as never,
    );

    expect(result[0].records).toEqual([
      {
        id: 'existing-company',
        domainNamePrimaryLinkUrl: 'acme.com',
      },
    ]);
  });

  it('normalizes trimmed nested duplicate fields from unsaved payloads', () => {
    const service = new CommonFindDuplicatesQueryRunnerService();

    const normalizedRecord = (
      service as never as {
        normalizeRecordForDuplicateLookup: (
          record: Partial<ObjectRecord>,
          flatObjectMetadata: {
            duplicateCriteria: string[][];
          },
          flatFieldMetadataMaps: Record<string, unknown>,
        ) => Partial<ObjectRecord>;
      }
    ).normalizeRecordForDuplicateLookup(
      {
        domainName: { primaryLinkUrl: '  acme.com  ' },
      },
      {
        duplicateCriteria: [['domainNamePrimaryLinkUrl']],
      },
      {
        byUniversalIdentifier: {},
        universalIdentifierById: {},
        universalIdentifiersByApplicationId: {},
      },
    );

    expect(normalizedRecord.domainNamePrimaryLinkUrl).toBe('acme.com');
  });

  it('applies only name-based matching when domain data is absent', async () => {
    mockedBuildDuplicateConditions.mockImplementation(
      (_objectMetadata, _objectMetadataMaps, _fieldMetadataMaps, records) => {
        const record = records?.[0];

        if (
          record?.name === 'Acme Corp' &&
          !('domainNamePrimaryLinkUrl' in (record ?? {}))
        ) {
          return { or: [{ name: { eq: 'Acme Corp' } }] };
        }

        return {};
      },
    );

    const service = new CommonFindDuplicatesQueryRunnerService();
    (service as never as { processNestedRelationsHelper: { processNestedRelations: jest.Mock } }).processNestedRelationsHelper =
      {
        processNestedRelations: jest.fn(),
      };
    const { queryRunnerContext } = createBaseContext([
      { id: 'existing-company', name: 'Acme Corp' },
    ]);

    const result = await service.run(
      {
        data: [{ name: 'Acme Corp' }],
        selectedFieldsResult: {
          select: { name: true },
          relations: undefined as never,
          aggregate: {},
        },
      },
      queryRunnerContext as never,
    );

    expect(result[0].records).toEqual([
      { id: 'existing-company', name: 'Acme Corp' },
    ]);
  });

  it('filters fuzzy company name candidates down to records above the similarity threshold', async () => {
    mockedBuildDuplicateConditions.mockReturnValue({
      or: [
        {
          or: [
            { name: { eq: 'Acme Corporaton' } },
            { name: { ilike: '%acme%' } },
            { name: { ilike: '%corporaton%' } },
          ],
        },
      ],
    });

    const service = new CommonFindDuplicatesQueryRunnerService();
    (service as never as { processNestedRelationsHelper: { processNestedRelations: jest.Mock } }).processNestedRelationsHelper =
      {
        processNestedRelations: jest.fn(),
      };
    const { queryRunnerContext, duplicateRecordsQueryBuilder } = createBaseContext([
      { id: 'matching-company', name: 'Acme Corporation' },
      { id: 'false-positive-company', name: 'Acme Ventures' },
    ]);

    const result = await service.run(
      {
        data: [{ name: 'Acme Corporaton' }],
        selectedFieldsResult: {
          select: { name: true },
          relations: undefined as never,
          aggregate: {},
        },
      },
      queryRunnerContext as never,
    );

    expect(result[0].records).toEqual([
      { id: 'matching-company', name: 'Acme Corporation' },
    ]);
    expect(result[0].totalCount).toBe(1);
    expect(duplicateRecordsQueryBuilder.take).not.toHaveBeenCalled();
    expect(duplicateRecordsQueryBuilder.setFindOptions).toHaveBeenCalledWith({
      select: { id: true, name: true, domainNamePrimaryLinkUrl: true },
    });
  });

  it('keeps exact company domain duplicates even when fuzzy name matching is active for the object', async () => {
    mockedBuildDuplicateConditions.mockReturnValue({
      or: [
        {
          or: [{ name: { eq: 'Acme Corporaton' } }, { name: { ilike: '%acme%' } }],
        },
        {
          domainNamePrimaryLinkUrl: { eq: 'acme.com' },
        },
      ],
    });

    const service = new CommonFindDuplicatesQueryRunnerService();
    (service as never as { processNestedRelationsHelper: { processNestedRelations: jest.Mock } }).processNestedRelationsHelper =
      {
        processNestedRelations: jest.fn(),
      };
    const { queryRunnerContext } = createBaseContext([
      {
        id: 'domain-match-company',
        name: 'Different Name',
        domainNamePrimaryLinkUrl: 'acme.com',
      },
    ]);

    const result = await service.run(
      {
        data: [
          {
            name: 'Acme Corporaton',
            domainName: { primaryLinkUrl: 'acme.com' },
          },
        ],
        selectedFieldsResult: {
          select: { name: true },
          relations: undefined as never,
          aggregate: {},
        },
      },
      queryRunnerContext as never,
    );

    expect(result[0].records).toEqual([
      { id: 'domain-match-company', name: 'Different Name' },
    ]);
    expect(result[0].totalCount).toBe(1);
  });

  it('filters 1000 fuzzy company-name candidates within the service-layer budget', async () => {
    mockedBuildDuplicateConditions.mockReturnValue({
      or: [
        {
          or: [{ name: { eq: 'Acme Corporaton' } }, { name: { ilike: '%acme%' } }],
        },
      ],
    });

    const service = new CommonFindDuplicatesQueryRunnerService();
    (service as never as { processNestedRelationsHelper: { processNestedRelations: jest.Mock } }).processNestedRelationsHelper =
      {
        processNestedRelations: jest.fn(),
      };
    const duplicateRecords = Array.from({ length: 1000 }, (_, index) => ({
      id: `company-${index}`,
      name: index === 777 ? 'Acme Corporation' : `Acme Variant ${index}`,
    }));
    const { queryRunnerContext } = createBaseContext(duplicateRecords);

    const startedAt = process.hrtime.bigint();
    const result = await service.run(
      {
        data: [{ name: 'Acme Corporaton' }],
        selectedFieldsResult: {
          select: { name: true },
          relations: undefined as never,
          aggregate: {},
        },
      },
      queryRunnerContext as never,
    );
    const elapsedInMilliseconds =
      Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    expect(result[0].records).toEqual([
      { id: 'company-777', name: 'Acme Corporation' },
    ]);
    expect(result[0].totalCount).toBe(1);
    expect(elapsedInMilliseconds).toBeLessThan(100);
  });

  it('does not keep short duplicate field values that cannot trigger duplicate checks', () => {
    const service = new CommonFindDuplicatesQueryRunnerService();

    const normalizedRecord = (
      service as never as {
        normalizeRecordForDuplicateLookup: (
          record: Partial<ObjectRecord>,
          flatObjectMetadata: {
            duplicateCriteria: string[][];
          },
          flatFieldMetadataMaps: Record<string, unknown>,
        ) => Partial<ObjectRecord>;
      }
    ).normalizeRecordForDuplicateLookup(
      {
        name: 'Ac',
      },
      {
        duplicateCriteria: [['name']],
      },
      {
        byUniversalIdentifier: {},
        universalIdentifierById: {},
        universalIdentifiersByApplicationId: {},
      },
    );

    expect(normalizedRecord.name).toBeUndefined();
  });
});
