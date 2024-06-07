import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { AppPath } from '@/types/AppPath';
import { useDefaultHomePagePath } from '~/hooks/useDefaultHomePagePath';
import { mockedUsersData } from '~/testing/mock-data/users';

const objectMetadataItem = getObjectMetadataItemsMock()[0];
jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mocked(useObjectMetadataItem).mockReturnValue({
  objectMetadataItem,
});

jest.mock('@/prefetch/hooks/usePrefetchedData');
const setupMockPrefetchedData = (viewId?: string) => {
  jest.mocked(usePrefetchedData).mockReturnValue({
    isDataPrefetched: true,
    records: viewId
      ? [
          {
            id: viewId,
            __typename: 'object',
            objectMetadataId: objectMetadataItem.id,
          },
        ]
      : [],
  });
};

const renderHooks = (withCurrentUser: boolean) => {
  const { result } = renderHook(
    () => {
      const setCurrentUser = useSetRecoilState(currentUserState);
      if (withCurrentUser) {
        setCurrentUser(mockedUsersData[0]);
      }
      return useDefaultHomePagePath();
    },
    {
      wrapper: RecoilRoot,
    },
  );
  return { result };
};
describe('useDefaultHomePagePath', () => {
  it('should return proper path when no currentUser', () => {
    setupMockPrefetchedData();
    const { result } = renderHooks(false);
    expect(result.current.defaultHomePagePath).toEqual(AppPath.SignInUp);
  });
  it('should return proper path when no currentUser and existing view', () => {
    setupMockPrefetchedData('viewId');
    const { result } = renderHooks(false);
    expect(result.current.defaultHomePagePath).toEqual(AppPath.SignInUp);
  });
  it('should return proper path when currentUser is defined', () => {
    setupMockPrefetchedData();
    const { result } = renderHooks(true);
    expect(result.current.defaultHomePagePath).toEqual('/objects/companies');
  });
  it('should return proper path when currentUser is defined and view exists', () => {
    setupMockPrefetchedData('viewId');
    const { result } = renderHooks(true);
    expect(result.current.defaultHomePagePath).toEqual(
      '/objects/companies?view=viewId',
    );
  });
});
