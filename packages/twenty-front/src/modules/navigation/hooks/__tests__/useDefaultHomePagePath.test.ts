import { renderHook, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { arePrefetchViewsLoadedState } from '@/prefetch/states/arePrefetchViewsLoaded';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { AppPath } from '@/types/AppPath';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { ViewType } from '@/views/types/ViewType';
import { getMockCompanyObjectMetadataItem } from '~/testing/mock-data/companies';
import { mockedUserData } from '~/testing/mock-data/users';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const renderHooks = ({
  withCurrentUser,
  withExistingView,
}: {
  withCurrentUser: boolean;
  withExistingView: boolean;
}) => {
  const { result } = renderHook(
    () => {
      const setCurrentUser = useSetRecoilState(currentUserState);
      const setCurrentUserWorkspace = useSetRecoilState(
        currentUserWorkspaceState,
      );
      const setObjectMetadataItems = useSetRecoilState(
        objectMetadataItemsState,
      );
      const setPrefetchViews = useSetRecoilState(prefetchViewsState);
      const setArePrefetchViewsLoaded = useSetRecoilState(
        arePrefetchViewsLoadedState,
      );

      useEffect(() => {
        setObjectMetadataItems(generatedMockObjectMetadataItems);
        setArePrefetchViewsLoaded(true);

        if (withExistingView) {
          setPrefetchViews([
            {
              id: 'viewId',
              name: 'Test View',
              objectMetadataId: getMockCompanyObjectMetadataItem().id,
              type: ViewType.Table,
              key: null,
              isCompact: false,
              openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
              viewFields: [],
              viewGroups: [],
              viewSorts: [],
              kanbanFieldMetadataId: '',
              kanbanAggregateOperation: AggregateOperations.COUNT,
              icon: '',
              kanbanAggregateOperationFieldMetadataId: '',
              position: 0,
              viewFilters: [],
              __typename: 'View',
            },
          ]);
        } else {
          setPrefetchViews([]);
        }

        if (withCurrentUser) {
          setCurrentUser(mockedUserData);
          setCurrentUserWorkspace(mockedUserData.currentUserWorkspace);
        }
      }, [
        setCurrentUser,
        setCurrentUserWorkspace,
        setObjectMetadataItems,
        setPrefetchViews,
        setArePrefetchViewsLoaded,
      ]);

      return useDefaultHomePagePath();
    },
    {
      wrapper: RecoilRoot,
    },
  );
  return { result };
};

describe('useDefaultHomePagePath', () => {
  it('should return proper path when no currentUser', async () => {
    const { result } = renderHooks({
      withCurrentUser: false,
      withExistingView: false,
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(AppPath.SignInUp);
    });
  });
  it('should return proper path when no currentUser and existing view', async () => {
    const { result } = renderHooks({
      withCurrentUser: false,
      withExistingView: true,
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(AppPath.SignInUp);
    });
  });
  it('should return proper path when currentUser is defined', async () => {
    const { result } = renderHooks({
      withCurrentUser: true,
      withExistingView: false,
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual('/objects/companies');
    });
  });
  it('should return proper path when currentUser is defined and view exists', async () => {
    const { result } = renderHooks({
      withCurrentUser: true,
      withExistingView: true,
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(
        '/objects/companies?viewId=viewId',
      );
    });
  });
});
