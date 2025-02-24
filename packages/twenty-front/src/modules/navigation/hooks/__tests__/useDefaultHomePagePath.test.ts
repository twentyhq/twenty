import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { AppPath } from '@/types/AppPath';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { ViewType } from '@/views/types/ViewType';
import { getCompanyObjectMetadataItem } from '~/testing/mock-data/companies';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { mockedUserData } from '~/testing/mock-data/users';

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
      const setObjectMetadataItems = useSetRecoilState(
        objectMetadataItemsState,
      );
      const setPrefetchViews = useSetRecoilState(prefetchViewsState);

      setObjectMetadataItems(generatedMockObjectMetadataItems);

      if (withExistingView) {
        setPrefetchViews([
          {
            id: 'viewId',
            name: 'Test View',
            objectMetadataId: getCompanyObjectMetadataItem().id,
            type: ViewType.Table,
            key: null,
            isCompact: false,
            openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
            viewFields: [],
            viewGroups: [],
            viewSorts: [],
            kanbanFieldMetadataId: '',
            kanbanAggregateOperation: AGGREGATE_OPERATIONS.count,
            icon: '',
            kanbanAggregateOperationFieldMetadataId: '',
            position: 0,
            viewFilters: [],
            __typename: 'View',
          },
        ]);
      }

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
    const { result } = renderHooks({
      withCurrentUser: false,
      withExistingView: false,
    });
    expect(result.current.defaultHomePagePath).toEqual(AppPath.SignInUp);
  });
  it('should return proper path when no currentUser and existing view', () => {
    const { result } = renderHooks({
      withCurrentUser: false,
      withExistingView: true,
    });
    expect(result.current.defaultHomePagePath).toEqual(AppPath.SignInUp);
  });
  it('should return proper path when currentUser is defined', () => {
    const { result } = renderHooks({
      withCurrentUser: true,
      withExistingView: false,
    });
    expect(result.current.defaultHomePagePath).toEqual('/objects/companies');
  });
  it('should return proper path when currentUser is defined and view exists', () => {
    const { result } = renderHooks({
      withCurrentUser: true,
      withExistingView: true,
    });
    expect(result.current.defaultHomePagePath).toEqual(
      '/objects/companies?viewId=viewId',
    );
  });
});
