import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import {
  GetJestMetadataAndApolloMocksAndActionMenuWrapperProps,
  getJestMetadataAndApolloMocksAndActionMenuWrapper,
} from '~/testing/jest/getJestMetadataAndApolloMocksAndContextStoreWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getPeopleMock } from '~/testing/mock-data/people';
import { useRemoveFromFavoritesSingleRecordAction } from '../useRemoveFromFavoritesSingleRecordAction';

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

const peopleMock = getPeopleMock();

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

const wrapperConfigWithSelectedRecordNotAsFavorite: GetJestMetadataAndApolloMocksAndActionMenuWrapperProps =
  {
    ...wrapperConfigWithSelectedRecordAsFavorite,
    contextStoreTargetedRecordsRule: {
      mode: 'selection',
      selectedRecordIds: [peopleMock[1].id],
    },
  };

const wrapperWithSelectedRecordAsFavorite =
  getJestMetadataAndApolloMocksAndActionMenuWrapper(
    wrapperConfigWithSelectedRecordAsFavorite,
  );

const wrapperWithSelectedRecordNotAsFavorite =
  getJestMetadataAndApolloMocksAndActionMenuWrapper(
    wrapperConfigWithSelectedRecordNotAsFavorite,
  );

describe('useRemoveFromFavoritesSingleRecordAction', () => {
  it('should be registered when the record is a favorite', () => {
    const { result } = renderHook(
      () =>
        useRemoveFromFavoritesSingleRecordAction({
          objectMetadataItem: personMockObjectMetadataItem,
        }),
      {
        wrapper: wrapperWithSelectedRecordAsFavorite,
      },
    );

    expect(result.current.shouldBeRegistered).toBe(true);
  });

  it('should not be registered when the record is not a favorite', () => {
    const { result } = renderHook(
      () =>
        useRemoveFromFavoritesSingleRecordAction({
          objectMetadataItem: personMockObjectMetadataItem,
        }),
      {
        wrapper: wrapperWithSelectedRecordNotAsFavorite,
      },
    );

    expect(result.current.shouldBeRegistered).toBe(false);
  });

  it('should call deleteFavorite on click', () => {
    const { result } = renderHook(
      () =>
        useRemoveFromFavoritesSingleRecordAction({
          objectMetadataItem: personMockObjectMetadataItem,
        }),
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
