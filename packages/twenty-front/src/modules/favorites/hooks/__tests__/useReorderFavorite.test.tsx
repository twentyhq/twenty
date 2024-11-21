import { DropResult, ResponderProvided } from '@hello-pangea/dnd';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useReorderFavorite } from '@/favorites/hooks/useReorderFavorite';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import {
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

describe('useReorderFavorite', () => {
  it('should handle reordering favorites successfully', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        setCurrentWorkspaceMember(mockWorkspaceMember);

        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(generatedMockObjectMetadataItems);

        return useReorderFavorite();
      },
      { wrapper: Wrapper },
    );

    act(() => {
      const dragAndDropResult: DropResult = {
        source: { index: 0, droppableId: 'droppableId' },
        destination: { index: 2, droppableId: 'droppableId' },
        combine: null,
        mode: 'FLUID',
        draggableId: '1',
        type: 'type',
        reason: 'DROP',
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
