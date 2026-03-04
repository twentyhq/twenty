import { act, renderHook } from '@testing-library/react';

import { useRecordOneToManyFieldAttachTargetRecord } from '@/object-record/hooks/useRecordOneToManyFieldAttachTargetRecord';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockUpdateOneRecord = jest.fn();
const mockGetRecordFromCache = jest.fn();
const mockUpdateRecordFromCache = jest.fn();

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({
    updateOneRecord: mockUpdateOneRecord,
  }),
}));

jest.mock('@/object-record/cache/utils/getRecordFromCache', () => ({
  getRecordFromCache: (...args: unknown[]) => mockGetRecordFromCache(...args),
}));

jest.mock('@/object-record/cache/utils/updateRecordFromCache', () => ({
  updateRecordFromCache: (...args: unknown[]) =>
    mockUpdateRecordFromCache(...args),
}));

jest.mock(
  '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord',
  () => ({
    generateDepthRecordGqlFieldsFromRecord: () => ({ id: true }),
  }),
);

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: [
      { id: 'opportunity-id', nameSingular: 'opportunity', fields: [] },
      { id: 'company-id', nameSingular: 'company', fields: [] },
    ],
  }),
}));

jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({
    objectPermissionsByObjectMetadataId: {},
  }),
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({});

const attachArgs = {
  sourceObjectNameSingular: 'company',
  targetObjectNameSingular: 'opportunity',
  targetGQLFieldName: 'company',
  sourceRecordId: 'company-1',
  targetRecordId: 'opportunity-1',
};

describe('useRecordOneToManyFieldAttachTargetRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should still persist the relation when the target record is not in Apollo cache', async () => {
    mockGetRecordFromCache.mockReturnValue(null);

    const { result } = renderHook(
      () => useRecordOneToManyFieldAttachTargetRecord(),
      { wrapper: Wrapper },
    );

    await act(async () => {
      await result.current.recordOneToManyFieldAttachTargetRecord(attachArgs);
    });

    expect(mockUpdateRecordFromCache).not.toHaveBeenCalled();
    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: 'opportunity',
      idToUpdate: 'opportunity-1',
      updateOneRecordInput: { companyId: 'company-1' },
    });
  });

  it('should optimistically update the previous parent in cache when re-parenting', async () => {
    mockGetRecordFromCache
      .mockReturnValueOnce({ id: 'opportunity-1', companyId: 'old-company' })
      .mockReturnValueOnce({ id: 'old-company' });

    const { result } = renderHook(
      () => useRecordOneToManyFieldAttachTargetRecord(),
      { wrapper: Wrapper },
    );

    await act(async () => {
      await result.current.recordOneToManyFieldAttachTargetRecord(attachArgs);
    });

    expect(mockUpdateRecordFromCache).toHaveBeenCalledTimes(1);
    expect(mockUpdateRecordFromCache).toHaveBeenCalledWith(
      expect.objectContaining({
        record: expect.objectContaining({
          id: 'opportunity-1',
          company: { id: 'old-company' },
        }),
      }),
    );
    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: 'opportunity',
      idToUpdate: 'opportunity-1',
      updateOneRecordInput: { companyId: 'company-1' },
    });
  });
});
