import { renderHook, waitFor } from '@testing-library/react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import {
  favoriteId,
  initialFavorites,
  mockWorkspaceMember,
  mocks,
} from '@/favorites/hooks/__mocks__/useFavorites';

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: () => ({ records: initialFavorites }),
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useDeleteFavorite', () => {
  beforeEach(() => {
    jotaiStore.set(
      objectMetadataItemsState.atom,
      generatedMockObjectMetadataItems,
    );
  });

  it('should delete favorite successfully', async () => {
    jotaiStore.set(currentWorkspaceMemberState.atom, mockWorkspaceMember);

    const { result } = renderHook(() => useDeleteFavorite(), {
      wrapper: Wrapper,
    });

    result.current.deleteFavorite(favoriteId);

    await waitFor(() => {
      expect(mocks[1].result).toHaveBeenCalled();
    });
  });
});
