import { renderHook, waitFor } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import {
  favoriteTargetObjectRecord,
  initialFavorites,
  mockId,
  mockWorkspaceMember,
  mocks,
} from '../__mocks__/useFavorites';

jest.mock('uuid', () => ({
  v4: () => mockId,
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: () => ({ records: initialFavorites }),
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useCreateFavorite', () => {
  it('should create favorite successfully', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        setCurrentWorkspaceMember(mockWorkspaceMember);

        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(generatedMockObjectMetadataItems);

        return useCreateFavorite();
      },
      { wrapper: Wrapper },
    );

    result.current.createFavorite(
      favoriteTargetObjectRecord,
      CoreObjectNameSingular.Person,
    );

    await waitFor(() => {
      expect(mocks[0].result).toHaveBeenCalled();
    });
  });
});
