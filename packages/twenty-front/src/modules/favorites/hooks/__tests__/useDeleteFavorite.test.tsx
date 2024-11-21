import { renderHook, waitFor } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import {
  favoriteId,
  initialFavorites,
  mockWorkspaceMember,
  mocks,
} from '../__mocks__/useFavorites';

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: () => ({ records: initialFavorites }),
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
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
