import { renderHook } from '@testing-library/react';

import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: jest.fn(),
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

describe('useAttachments', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches attachments correctly for a given targetableObject', () => {
    const mockAttachments = [
      { id: '1', name: 'Attachment 1' },
      { id: 2, name: 'Attachment 2' },
    ];
    const mockTargetableObject = {
      id: '1',
      targetObjectNameSingular: 'person',
    };

    const useFindManyRecordsMock = jest.requireMock(
      '@/object-record/hooks/useFindManyRecords',
    );
    const useIsFeatureEnabledMock = jest.requireMock(
      '@/workspace/hooks/useIsFeatureEnabled',
    );
    useFindManyRecordsMock.useFindManyRecords.mockReturnValue({
      records: mockAttachments,
    });
    useIsFeatureEnabledMock.useIsFeatureEnabled.mockReturnValue(false);

    const { result } = renderHook(() => useAttachments(mockTargetableObject), {
      wrapper: Wrapper,
    });

    expect(result.current.attachments).toEqual(mockAttachments);
  });

  it('handles case when there are no attachments', () => {
    const mockTargetableObject = {
      id: '1',
      targetObjectNameSingular: 'person',
    };

    const useFindManyRecordsMock = jest.requireMock(
      '@/object-record/hooks/useFindManyRecords',
    );
    const useIsFeatureEnabledMock = jest.requireMock(
      '@/workspace/hooks/useIsFeatureEnabled',
    );
    useFindManyRecordsMock.useFindManyRecords.mockReturnValue({ records: [] });
    useIsFeatureEnabledMock.useIsFeatureEnabled.mockReturnValue(false);

    const { result } = renderHook(() => useAttachments(mockTargetableObject), {
      wrapper: Wrapper,
    });

    expect(result.current.attachments).toEqual([]);
  });
});
