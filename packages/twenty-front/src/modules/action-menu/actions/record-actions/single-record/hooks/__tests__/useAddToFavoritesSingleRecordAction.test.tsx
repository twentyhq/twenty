import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import {
  GetJestMetadataAndApolloMocksAndActionMenuWrapperProps,
  getJestMetadataAndApolloMocksAndActionMenuWrapper,
} from '~/testing/jest/getJestMetadataAndApolloMocksAndContextStoreWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getPeopleMock } from '~/testing/mock-data/people';
import { useAddToFavoritesSingleRecordAction } from '../useAddToFavoritesSingleRecordAction';

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

const createFavoriteMock = jest.fn();

jest.mock('@/favorites/hooks/useCreateFavorite', () => ({
  useCreateFavorite: () => ({
    createFavorite: createFavoriteMock,
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

describe('useAddToFavoritesSingleRecordAction', () => {
  it('should be registered when the record is not a favorite', () => {
    const { result } = renderHook(
      () =>
        useAddToFavoritesSingleRecordAction({
          objectMetadataItem: personMockObjectMetadataItem,
        }),
      {
        wrapper: wrapperWithSelectedRecordNotAsFavorite,
      },
    );

    expect(result.current.shouldBeRegistered).toBe(true);
  });

  it('should not be registered when the record is a favorite', () => {
    const { result } = renderHook(
      () =>
        useAddToFavoritesSingleRecordAction({
          objectMetadataItem: personMockObjectMetadataItem,
        }),
      {
        wrapper: wrapperWithSelectedRecordAsFavorite,
      },
    );

    expect(result.current.shouldBeRegistered).toBe(false);
  });

  it('should call createFavorite on click', () => {
    const { result } = renderHook(
      () =>
        useAddToFavoritesSingleRecordAction({
          objectMetadataItem: personMockObjectMetadataItem,
        }),
      {
        wrapper: wrapperWithSelectedRecordNotAsFavorite,
      },
    );

    act(() => {
      result.current.onClick();
    });

    expect(createFavoriteMock).toHaveBeenCalledWith(
      peopleMock[1],
      personMockObjectMetadataItem.nameSingular,
    );
  });
});
