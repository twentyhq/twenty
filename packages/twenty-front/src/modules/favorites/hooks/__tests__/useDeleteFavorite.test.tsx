import { renderHook, waitFor } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import {
  favoriteId,
  initialFavorites,
  mockWorkspaceMember,
  mocks,
} from '@/favorites/hooks/__mocks__/useFavorites';
import { vi } from 'vitest';

vi.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: () => ({ records: initialFavorites }),
}));

const Wrapper = getTestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useDeleteFavorite', () => {
  it('should delete favorite successfully', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        setCurrentWorkspaceMember(mockWorkspaceMember);

        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(generatedMockObjectMetadataItems);

        return useDeleteFavorite();
      },
      { wrapper: Wrapper },
    );

    result.current.deleteFavorite(favoriteId);

    await waitFor(() => {
      expect(mocks[1].result).toHaveBeenCalled();
    });
  });
});
