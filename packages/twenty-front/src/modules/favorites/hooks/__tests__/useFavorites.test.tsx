import { DropResult, ResponderProvided } from '@hello-pangea/dnd';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';

import { useFavorites } from '@/favorites/hooks/useFavorites';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import {
  favoriteId,
  favoriteTargetObjectRecord,
  initialFavorites,
  mockFolders,
  mockId,
  mocks,
  mockWorkspaceMember,
  sortedFavorites,
} from '../__mocks__/useFavorites';

jest.mock('uuid', () => ({
  v4: jest.fn(() => mockId),
}));

jest.mock('@/favorites/hooks/usePrefetchedFavoritesData', () => ({
  usePrefetchedFavoritesData: () => ({
    favorites: initialFavorites,
    workspaceFavorites: [],
    folders: mockFolders,
    currentWorkspaceMemberId: mockWorkspaceMember.id,
  }),
}));

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useFavorites', () => {
  const renderUseFavorites = () => {
    return renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(generatedMockObjectMetadataItems);
        return useFavorites();
      },
      {
        wrapper: Wrapper,
      },
    );
  };

  it('should fetch favorites and folders successfully', async () => {
    const { result } = renderUseFavorites();

    expect(result.current.favorites).toEqual(sortedFavorites);
    expect(result.current.favoritesByFolder).toBeDefined();
    expect(result.current.favoritesByFolder).toHaveLength(mockFolders.length);
  });

  it('should organize favorites by folder correctly', async () => {
    const { result } = renderUseFavorites();

    const folderFavorites = result.current.favoritesByFolder[0];
    expect(folderFavorites.folderId).toBe('folder-1');
    expect(folderFavorites.favorites).toBeDefined();
    expect(folderFavorites.favorites.some((fav) => fav.id === '1')).toBe(true);
  });

  it('should createOneFavorite successfully', async () => {
    const { result } = renderUseFavorites();

    result.current.createFavorite(
      favoriteTargetObjectRecord,
      CoreObjectNameSingular.Person,
    );

    await waitFor(() => {
      expect(mocks[0].result).toHaveBeenCalled();
    });
  });

  it('should create favorite with folder successfully', async () => {
    const { result } = renderUseFavorites();

    result.current.createFavorite(
      favoriteTargetObjectRecord,
      CoreObjectNameSingular.Person,
      'folder-1',
    );

    await waitFor(() => {
      expect(mocks[1].result).toHaveBeenCalled();
    });
  });

  it('should deleteOneRecord successfully', async () => {
    const { result } = renderUseFavorites();

    result.current.deleteFavorite(favoriteId);

    await waitFor(() => {
      expect(mocks[2].result).toHaveBeenCalled();
    });
  });

  it('should handle reordering favorites within folder successfully', async () => {
    const { result } = renderUseFavorites();

    act(() => {
      // We're moving from position 0 to 1 within folder-1
      const dragAndDropResult: DropResult = {
        source: { index: 0, droppableId: 'folder-1' },
        destination: { index: 1, droppableId: 'folder-1' },
        draggableId: '1', // This should be an ID that exists in initialFavorites
        type: 'FAVORITE',
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      const responderProvided: ResponderProvided = {
        announce: () => {},
      };

      result.current.handleReorderFavorite(
        dragAndDropResult,
        responderProvided,
      );
    });

    await waitFor(() => {
      expect(mocks[2].result).toHaveBeenCalled();
    });
  });
});
