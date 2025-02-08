import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { AppPath } from '@/types/AppPath';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { mockedUserData } from '~/testing/mock-data/users';

jest.mock('@/prefetch/hooks/usePrefetchedData');
const setupMockPrefetchedData = (viewId?: string) => {
  const companyObjectMetadata = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'company',
  );

  jest.mocked(usePrefetchedData).mockReturnValue({
    isDataPrefetched: true,
    records: viewId
      ? [
          {
            id: viewId,
            __typename: 'object',
            objectMetadataId: companyObjectMetadata?.id,
          },
        ]
      : [],
  });
};

const renderHooks = (withCurrentUser: boolean) => {
  const { result } = renderHook(
    () => {
      const setCurrentUser = useSetRecoilState(currentUserState);
      const setObjectMetadataItems = useSetRecoilState(
        objectMetadataItemsState,
      );

      setObjectMetadataItems(generatedMockObjectMetadataItems);

      if (withCurrentUser) {
        setCurrentUser(mockedUserData);
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
      '/objects/companies?viewId=viewId',
    );
  });
});
