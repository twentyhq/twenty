import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import {
  GetJestMetadataAndApolloMocksAndActionMenuWrapperProps,
  getJestMetadataAndApolloMocksAndActionMenuWrapper,
} from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getPeopleRecordConnectionMock } from '~/testing/mock-data/people';
import { useRemoveFromFavoritesSingleRecordAction } from '../useRemoveFromFavoritesSingleRecordAction';

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

const peopleMock = getPeopleRecordConnectionMock();

const favoritesMock = [
  {
    id: '1',
    recordId: peopleMock[0].id,
    position: 0,
    avatarType: 'rounded',
    avatarUrl: '',
    labelIdentifier: ' ',
    link: `/object/${personMockObjectMetadataItem.nameSingular}/${peopleMock[0].id}`,
    objectNameSingular: personMockObjectMetadataItem.nameSingular,
    workspaceMemberId: '1',
    favoriteFolderId: undefined,
  },
];

jest.mock('@/favorites/hooks/useFavorites', () => ({
  useFavorites: () => ({
    favorites: favoritesMock,
    sortedFavorites: favoritesMock,
  }),
}));

const deleteFavoriteMock = jest.fn();

jest.mock('@/favorites/hooks/useDeleteFavorite', () => ({
  useDeleteFavorite: () => ({
    deleteFavorite: deleteFavoriteMock,
  }),
}));

const wrapperConfigWithSelectedRecordAsFavorite: GetJestMetadataAndApolloMocksAndActionMenuWrapperProps =
  {
    apolloMocks: [],
    componentInstanceId: '1',
    contextStoreCurrentObjectMetadataNameSingular:
      personMockObjectMetadataItem.nameSingular,
    contextStoreTargetedRecordsRule: {
      mode: 'selection',
      selectedRecordIds: [peopleMock[0].id],
    },
    onInitializeRecoilSnapshot: (snapshot) => {
      snapshot.set(recordStoreFamilyState(peopleMock[0].id), peopleMock[0]);
      snapshot.set(recordStoreFamilyState(peopleMock[1].id), peopleMock[1]);
    },
  };

const wrapperWithSelectedRecordAsFavorite =
  getJestMetadataAndApolloMocksAndActionMenuWrapper(
    wrapperConfigWithSelectedRecordAsFavorite,
  );

describe('useRemoveFromFavoritesSingleRecordAction', () => {
  it('should call deleteFavorite on click', () => {
    const { result } = renderHook(
      () => useRemoveFromFavoritesSingleRecordAction(),
      {
        wrapper: wrapperWithSelectedRecordAsFavorite,
      },
    );

    act(() => {
      result.current.onClick();
    });

    expect(deleteFavoriteMock).toHaveBeenCalledWith(favoritesMock[0].id);
  });
});
