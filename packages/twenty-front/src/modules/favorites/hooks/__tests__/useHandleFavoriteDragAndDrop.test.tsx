import { type DropResult, type ResponderProvided } from '@hello-pangea/dnd';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FAVORITE_DROPPABLE_IDS } from '@/favorites/constants/FavoriteDroppableIds';
import { useHandleFavoriteDragAndDrop } from '@/favorites/hooks/useHandleFavoriteDragAndDrop';
import { type Favorite } from '@/favorites/types/Favorite';
import { createFolderDroppableId } from '@/favorites/utils/createFolderDroppableId';
import { createFolderHeaderDroppableId } from '@/favorites/utils/createFolderHeaderDroppableId';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { prefetchFavoritesState } from '@/prefetch/states/prefetchFavoritesState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import {
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

describe('useHandleFavoriteDragAndDrop', () => {
  const mockResponderProvided: ResponderProvided = {
    announce: jest.fn(),
  };

  const setupHook = () => {
    return renderHook(
      () => {
        const setPrefetchFavorites = useSetRecoilState(prefetchFavoritesState);
        setPrefetchFavorites(initialFavorites as Favorite[]);

        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);

        setCurrentWorkspaceMember(mockWorkspaceMember);
        setMetadataItems(generatedMockObjectMetadataItems);

        return {
          hook: useHandleFavoriteDragAndDrop(),
        };
      },
      { wrapper: Wrapper },
    );
  };

  it('should not update when destination is null', () => {
    const { result } = setupHook();

    act(() => {
      result.current.hook.handleFavoriteDragAndDrop(
        {
          source: { index: 0, droppableId: createFolderDroppableId('1') },
          destination: null,
          draggableId: '1',
        } as DropResult,
        mockResponderProvided,
      );
    });

    expect(mocks[2].result).not.toHaveBeenCalled();
    expect(mocks[3].result).not.toHaveBeenCalled();
    expect(mocks[4].result).not.toHaveBeenCalled();
  });

  it('should not update when destination is same as source', () => {
    const { result } = setupHook();
    const folderOneId = createFolderDroppableId('1');

    act(() => {
      result.current.hook.handleFavoriteDragAndDrop(
        {
          source: { index: 0, droppableId: folderOneId },
          destination: { index: 0, droppableId: folderOneId },
          draggableId: '1',
        } as DropResult,
        mockResponderProvided,
      );
    });

    expect(mocks[2].result).not.toHaveBeenCalled();
    expect(mocks[3].result).not.toHaveBeenCalled();
    expect(mocks[4].result).not.toHaveBeenCalled();
  });

  it('should reorder within same folder', async () => {
    const { result } = setupHook();
    const folderOneId = createFolderDroppableId('1');

    act(() => {
      result.current.hook.handleFavoriteDragAndDrop(
        {
          source: { index: 0, droppableId: folderOneId },
          destination: { index: 2, droppableId: folderOneId },
          draggableId: '1',
        } as DropResult,
        mockResponderProvided,
      );
    });

    await waitFor(() => {
      expect(mocks[2].result).toHaveBeenCalled();
    });
  });

  it('should move to another folder', async () => {
    const { result } = setupHook();

    act(() => {
      result.current.hook.handleFavoriteDragAndDrop(
        {
          source: { index: 0, droppableId: createFolderDroppableId('1') },
          destination: { index: 0, droppableId: createFolderDroppableId('2') },
          draggableId: '1',
        } as DropResult,
        mockResponderProvided,
      );
    });

    await waitFor(() => {
      expect(mocks[3].result).toHaveBeenCalled();
    });
  });

  it('should move to orphan favorites', async () => {
    const { result } = setupHook();

    act(() => {
      result.current.hook.handleFavoriteDragAndDrop(
        {
          source: { index: 0, droppableId: createFolderDroppableId('1') },
          destination: {
            index: 0,
            droppableId: FAVORITE_DROPPABLE_IDS.ORPHAN_FAVORITES,
          },
          draggableId: '1',
        } as DropResult,
        mockResponderProvided,
      );
    });

    await waitFor(() => {
      expect(mocks[4].result).toHaveBeenCalled();
    });
  });

  it('should handle dropping into folder header', async () => {
    const { result } = setupHook();

    act(() => {
      result.current.hook.handleFavoriteDragAndDrop(
        {
          source: { index: 0, droppableId: createFolderDroppableId('1') },
          destination: {
            index: 0,
            droppableId: createFolderHeaderDroppableId('2'),
          },
          draggableId: '1',
        } as DropResult,
        mockResponderProvided,
      );
    });

    await waitFor(() => {
      expect(mocks[3].result).toHaveBeenCalled();
    });
  });
});
