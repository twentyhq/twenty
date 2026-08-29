import { renderHook } from '@testing-library/react';

import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useUpdateSdkClientChecksumsApolloCache } from '@/front-components/hooks/useUpdateSdkClientChecksumsApolloCache';
import { type ApplicationSdkClientChecksumsBroadcastRecord } from '@/front-components/types/ApplicationSdkClientChecksumsBroadcastRecord';

const mockReadQuery = jest.fn();
const mockUpdateQuery = jest.fn();
const mockQuery = jest.fn().mockResolvedValue({ data: undefined });
const mockApolloClient = {
  cache: { readQuery: mockReadQuery, updateQuery: mockUpdateQuery },
  query: mockQuery,
};

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => mockApolloClient,
}));

const APPLICATION_ID = 'app-test-id';

const CACHED_CHECKSUM_PAIR = {
  applicationSdkClientChecksums: {
    __typename: 'SdkClientChecksums' as const,
    core: 'old-core-checksum',
    metadata: 'old-metadata-checksum',
  },
};

const buildApplicationRecord = (
  overrides: Partial<ApplicationSdkClientChecksumsBroadcastRecord> = {},
): ApplicationSdkClientChecksumsBroadcastRecord => ({
  id: APPLICATION_ID,
  sdkClientCoreChecksum: 'a'.repeat(64),
  ...overrides,
});

const buildUpdateDetail = (
  updatedRecord: ApplicationSdkClientChecksumsBroadcastRecord,
): MetadataOperationBrowserEventDetail<ApplicationSdkClientChecksumsBroadcastRecord> => ({
  metadataName: 'application',
  operation: {
    type: 'update',
    updatedRecord,
  },
});

describe('useUpdateSdkClientChecksumsApolloCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadQuery.mockReturnValue(CACHED_CHECKSUM_PAIR);
  });

  it('should call cache.updateQuery when the application id matches', () => {
    const { result } = renderHook(() =>
      useUpdateSdkClientChecksumsApolloCache({
        applicationId: APPLICATION_ID,
      }),
    );

    result.current.updateSdkClientChecksumsApolloCache(
      buildUpdateDetail(buildApplicationRecord()),
    );

    expect(mockUpdateQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('should not call cache.updateQuery when the application id does not match', () => {
    const { result } = renderHook(() =>
      useUpdateSdkClientChecksumsApolloCache({
        applicationId: APPLICATION_ID,
      }),
    );

    result.current.updateSdkClientChecksumsApolloCache(
      buildUpdateDetail(buildApplicationRecord({ id: 'other-app-id' })),
    );

    expect(mockUpdateQuery).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('should not call cache.updateQuery when applicationId is undefined', () => {
    const { result } = renderHook(() =>
      useUpdateSdkClientChecksumsApolloCache({}),
    );

    result.current.updateSdkClientChecksumsApolloCache(
      buildUpdateDetail(buildApplicationRecord()),
    );

    expect(mockUpdateQuery).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('should not call cache.updateQuery when checksums are missing', () => {
    const { result } = renderHook(() =>
      useUpdateSdkClientChecksumsApolloCache({
        applicationId: APPLICATION_ID,
      }),
    );

    result.current.updateSdkClientChecksumsApolloCache(
      buildUpdateDetail(
        buildApplicationRecord({ sdkClientCoreChecksum: null }),
      ),
    );

    expect(mockUpdateQuery).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('should not call cache.updateQuery for create operations', () => {
    const { result } = renderHook(() =>
      useUpdateSdkClientChecksumsApolloCache({
        applicationId: APPLICATION_ID,
      }),
    );

    result.current.updateSdkClientChecksumsApolloCache({
      metadataName: 'application',
      operation: {
        type: 'create',
        createdRecord: buildApplicationRecord(),
      },
    });

    expect(mockUpdateQuery).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('should update only the core checksum and preserve the cached metadata checksum', () => {
    const { result } = renderHook(() =>
      useUpdateSdkClientChecksumsApolloCache({
        applicationId: APPLICATION_ID,
      }),
    );

    result.current.updateSdkClientChecksumsApolloCache(
      buildUpdateDetail(buildApplicationRecord()),
    );

    const updaterFn = mockUpdateQuery.mock.calls[0][1];

    const updatedData = updaterFn(CACHED_CHECKSUM_PAIR);

    expect(updatedData.applicationSdkClientChecksums).toEqual({
      __typename: 'SdkClientChecksums',
      core: 'a'.repeat(64),
      metadata: 'old-metadata-checksum',
    });
  });

  it('should refetch the checksum query when no checksum pair is cached yet', () => {
    mockReadQuery.mockReturnValue({ applicationSdkClientChecksums: null });

    const { result } = renderHook(() =>
      useUpdateSdkClientChecksumsApolloCache({
        applicationId: APPLICATION_ID,
      }),
    );

    result.current.updateSdkClientChecksumsApolloCache(
      buildUpdateDetail(buildApplicationRecord()),
    );

    expect(mockUpdateQuery).not.toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { applicationId: APPLICATION_ID },
        fetchPolicy: 'network-only',
      }),
    );
  });

  it('should refetch the checksum query when the query result is absent from the cache', () => {
    mockReadQuery.mockReturnValue(null);

    const { result } = renderHook(() =>
      useUpdateSdkClientChecksumsApolloCache({
        applicationId: APPLICATION_ID,
      }),
    );

    result.current.updateSdkClientChecksumsApolloCache(
      buildUpdateDetail(buildApplicationRecord()),
    );

    expect(mockUpdateQuery).not.toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });
});
