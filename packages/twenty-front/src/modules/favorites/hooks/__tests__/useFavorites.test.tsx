import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { DropResult, ResponderProvided } from '@hello-pangea/dnd';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

import {
  favoriteId,
  favoriteTargetObjectRecord,
  initialFavorites,
  mockId,
  mocks,
  mockWorkspaceMember,
  sortedFavorites,
} from '../__mocks__/useFavorites';

jest.mock('uuid', () => ({
  v4: jest.fn(() => mockId),
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: () => ({ records: initialFavorites }),
}));

const mockObjectMetadataItems = getObjectMetadataItemsMock();

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    </SnackBarProviderScope>
  </RecoilRoot>
);

describe('useFavorites', () => {
  it('should fetch favorites successfully', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        setCurrentWorkspaceMember(mockWorkspaceMember);

        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return useFavorites();
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.favorites).toEqual(sortedFavorites);
  });

  it('should createOneFavorite successfully', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        setCurrentWorkspaceMember(mockWorkspaceMember);

        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return useFavorites();
      },
      {
        wrapper: Wrapper,
      },
    );

    result.current.createFavorite(
      favoriteTargetObjectRecord,
      CoreObjectNameSingular.Person,
    );

    await waitFor(() => {
      expect(mocks[0].result).toHaveBeenCalled();
    });
  });

  it('should deleteOneRecord successfully', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        setCurrentWorkspaceMember(mockWorkspaceMember);

        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return useFavorites();
      },
      {
        wrapper: Wrapper,
      },
    );

    result.current.deleteFavorite(favoriteId);

    await waitFor(() => {
      expect(mocks[1].result).toHaveBeenCalled();
    });
  });

  it('should handle reordering favorites successfully', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        setCurrentWorkspaceMember(mockWorkspaceMember);

        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return useFavorites();
      },
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      const dragAndDropResult: DropResult = {
        source: { index: 0, droppableId: 'droppableId' },
        destination: { index: 2, droppableId: 'droppableId' },
        combine: null,
        mode: 'FLUID',
        draggableId: 'draggableId',
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
