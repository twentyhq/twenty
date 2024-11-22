import { renderHook } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import {
  initialFavorites,
  mocks,
  mockWorkspaceMember,
  sortedFavorites,
} from '../__mocks__/useFavorites';

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: () => ({ records: initialFavorites }),
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useFavorites', () => {
  it('should fetch and sort favorites successfully', () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        setCurrentWorkspaceMember(mockWorkspaceMember);

        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(generatedMockObjectMetadataItems);

        return useFavorites();
      },
      { wrapper: Wrapper },
    );

    expect(result.current.sortedFavorites).toEqual(sortedFavorites);
  });
});
