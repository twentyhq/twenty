import { renderHook } from '@testing-library/react';

import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useUpdateSdkClientChecksumsApolloCache } from '@/front-components/hooks/useUpdateSdkClientChecksumsApolloCache';
import { type ApplicationSdkClientChecksumsBroadcastRecord } from '@/front-components/types/ApplicationSdkClientChecksumsBroadcastRecord';

const mockUpdateQuery = jest.fn();
const mockApolloClient = {
  cache: { updateQuery: mockUpdateQuery },
};

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => mockApolloClient,
}));

const APPLICATION_ID = 'app-test-id';

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
  });

  it('should not call cache.updateQuery when applicationId is undefined', () => {
    const { result } = renderHook(() =>
      useUpdateSdkClientChecksumsApolloCache({}),
    );

    result.current.updateSdkClientChecksumsApolloCache(
      buildUpdateDetail(buildApplicationRecord()),
    );

    expect(mockUpdateQuery).not.toHaveBeenCalled();
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

    const existingData = {
      applicationSdkClientChecksums: {
        __typename: 'SdkClientChecksums' as const,
        core: 'old-core-checksum',
        metadata: 'old-metadata-checksum',
      },
    };

    const updatedData = updaterFn(existingData);

    expect(updatedData.applicationSdkClientChecksums).toEqual({
      __typename: 'SdkClientChecksums',
      core: 'a'.repeat(64),
      metadata: 'old-metadata-checksum',
    });
  });

  it('should leave the cache untouched when no checksum pair is already cached', () => {
    const { result } = renderHook(() =>
      useUpdateSdkClientChecksumsApolloCache({
        applicationId: APPLICATION_ID,
      }),
    );

    result.current.updateSdkClientChecksumsApolloCache(
      buildUpdateDetail(buildApplicationRecord()),
    );

    const updaterFn = mockUpdateQuery.mock.calls[0][1];
    const existingData = { applicationSdkClientChecksums: null };

    expect(updaterFn(existingData)).toEqual(existingData);
  });

  it('should return existing data when nothing is cached yet', () => {
    const { result } = renderHook(() =>
      useUpdateSdkClientChecksumsApolloCache({
        applicationId: APPLICATION_ID,
      }),
    );

    result.current.updateSdkClientChecksumsApolloCache(
      buildUpdateDetail(buildApplicationRecord()),
    );

    const updaterFn = mockUpdateQuery.mock.calls[0][1];

    expect(updaterFn(undefined)).toBeUndefined();
  });
});
