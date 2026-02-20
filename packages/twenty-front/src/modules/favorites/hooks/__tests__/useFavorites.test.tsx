import { renderHook } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFavorites } from '@/favorites/hooks/useFavorites';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { prefetchFavoritesState } from '@/prefetch/states/prefetchFavoritesState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import {
  initialFavorites,
  mockWorkspaceMember,
  sortedFavorites,
} from '@/favorites/hooks/__mocks__/useFavorites';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useFavorites', () => {
  it('should fetch and sort favorites successfully', () => {
    jotaiStore.set(currentWorkspaceMemberState.atom, mockWorkspaceMember);

    const { result } = renderHook(
      () => {
        const setPrefetchFavorites = useSetRecoilState(prefetchFavoritesState);
        setPrefetchFavorites(initialFavorites);

        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(generatedMockObjectMetadataItems);

        return useFavorites();
      },
      { wrapper: Wrapper },
    );

    expect(result.current.sortedFavorites).toEqual(sortedFavorites);
  });
});
