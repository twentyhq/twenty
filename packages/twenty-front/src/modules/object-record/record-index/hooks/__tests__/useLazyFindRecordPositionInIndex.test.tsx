import { gql } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useLazyFindRecordPositionInIndex } from '@/object-record/record-index/hooks/useLazyFindRecordPositionInIndex';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const objectMetadataItem = getMockObjectMetadataItemOrThrow('opportunity');
const stageFieldMetadataItem = objectMetadataItem.fields.find(
  (field) => field.name === 'stage',
) as FieldMetadataItem;
const mockQuery = jest.fn();
const mockDocument = gql`
  query Test {
    __typename
  }
`;
const viewFilter = { name: { ilike: '%acme%' } };
const orderBy = [{ createdAt: 'DescNullsLast' }];
const targetCreatedAt = '2024-05-01T00:00:00.000Z';
const recordsBeforeTargetFilter = {
  or: [
    { createdAt: { gt: targetCreatedAt } },
    {
      and: [{ createdAt: { eq: targetCreatedAt } }, { id: { lt: 'record-1' } }],
    },
  ],
};
const recordGroupDefinitions: RecordGroupDefinition[] = [
  {
    id: 'group-new',
    type: 'value' as RecordGroupDefinition['type'],
    title: 'New',
    value: 'NEW',
    color: 'blue',
    position: 0,
    isVisible: true,
  },
  {
    id: 'group-won',
    type: 'value' as RecordGroupDefinition['type'],
    title: 'Won',
    value: 'WON',
    color: 'green',
    position: 1,
    isVisible: false,
  },
];
let mockCanRead = true;
let mockHasRecordGroups = false;
let mockRecordGroupFieldMetadataItem: FieldMetadataItem | undefined;

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem }),
}));
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ query: mockQuery }),
}));
jest.mock('@/object-record/hooks/useFindManyRecordsQuery', () => ({
  useFindManyRecordsQuery: () => ({ findManyRecordsQuery: mockDocument }),
}));
jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => ({ canReadObjectRecords: mockCanRead }),
}));
jest.mock(
  '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams',
  () => ({
    useFindManyRecordIndexTableParams: () => ({
      objectNameSingular: 'opportunity',
      filter: viewFilter,
      orderBy,
    }),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue',
  () => ({
    useAtomComponentSelectorValue: (selector: { key: string }) =>
      selector.key === 'hasRecordGroupsComponentSelector'
        ? mockHasRecordGroups
        : recordGroupDefinitions,
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => mockRecordGroupFieldMetadataItem,
  }),
);

const connection = (nodes: Record<string, unknown>[], totalCount: number) => ({
  data: {
    opportunities: { edges: nodes.map((node) => ({ node })), totalCount },
  },
});

const renderPosition = () =>
  renderHook(() => useLazyFindRecordPositionInIndex('opportunity'));

describe('useLazyFindRecordPositionInIndex', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockCanRead = true;
    mockHasRecordGroups = false;
    mockRecordGroupFieldMetadataItem = undefined;
  });

  it('counts the records the index sorts before the target', async () => {
    mockQuery
      .mockResolvedValueOnce(
        connection([{ id: 'record-1', createdAt: targetCreatedAt }], 1),
      )
      .mockResolvedValueOnce(connection([{ id: 'record-0' }], 42));
    const { result } = renderPosition();

    await expect(
      result.current.findRecordPositionInIndex('record-1'),
    ).resolves.toEqual({ position: 42, recordGroupId: undefined });

    expect(mockQuery).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: {
          filter: { and: [viewFilter, { id: { eq: 'record-1' } }] },
          limit: 1,
        },
      }),
    );
    expect(mockQuery).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: {
          filter: { and: [viewFilter, recordsBeforeTargetFilter] },
          limit: 1,
        },
      }),
    );
  });

  it('counts inside the record group when the index is grouped', async () => {
    mockHasRecordGroups = true;
    mockRecordGroupFieldMetadataItem = stageFieldMetadataItem;
    mockQuery
      .mockResolvedValueOnce(
        connection(
          [{ id: 'record-1', createdAt: targetCreatedAt, stage: 'NEW' }],
          1,
        ),
      )
      .mockResolvedValueOnce(connection([{ id: 'record-0' }], 7));
    const { result } = renderPosition();

    await expect(
      result.current.findRecordPositionInIndex('record-1'),
    ).resolves.toEqual({ position: 7, recordGroupId: 'group-new' });

    expect(mockQuery).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        variables: {
          filter: {
            and: [
              viewFilter,
              { stage: { in: ['NEW'] } },
              recordsBeforeTargetFilter,
            ],
          },
          limit: 1,
        },
      }),
    );
  });

  it('returns null when the record sits in a hidden group', async () => {
    mockHasRecordGroups = true;
    mockRecordGroupFieldMetadataItem = stageFieldMetadataItem;
    mockQuery.mockResolvedValueOnce(
      connection(
        [{ id: 'record-1', createdAt: targetCreatedAt, stage: 'WON' }],
        1,
      ),
    );
    const { result } = renderPosition();

    await expect(
      result.current.findRecordPositionInIndex('record-1'),
    ).resolves.toBeNull();
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('returns null when the index does not contain the record', async () => {
    mockQuery.mockResolvedValueOnce(connection([], 0));
    const { result } = renderPosition();

    await expect(
      result.current.findRecordPositionInIndex('record-1'),
    ).resolves.toBeNull();
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('does not query without read permission', async () => {
    mockCanRead = false;
    const { result } = renderPosition();

    await expect(
      result.current.findRecordPositionInIndex('record-1'),
    ).resolves.toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('returns null when a query fails', async () => {
    mockQuery.mockRejectedValue(new Error('Network unavailable'));
    const { result } = renderPosition();

    await expect(
      result.current.findRecordPositionInIndex('record-1'),
    ).resolves.toBeNull();
  });
});
