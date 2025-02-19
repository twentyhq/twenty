import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { findAllViewsOperationSignatureFactory } from '@/prefetch/graphql/operation-signatures/factories/findAllViewsOperationSignatureFactory';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { isPersistingViewFieldsState } from '@/views/states/isPersistingViewFieldsState';
import { View } from '@/views/types/View';
import { useIsWorkspaceActivationStatusSuspended } from '@/workspace/hooks/useIsWorkspaceActivationStatusSuspended';
import { isDefined } from 'twenty-shared';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const PrefetchRunViewQueryEffect = () => {
  const currentUser = useRecoilValue(currentUserState);

  const isWorkspaceSuspended = useIsWorkspaceActivationStatusSuspended();

  const { objectMetadataItems } = useObjectMetadataItems();

  const findAllViewsOperationSignature = findAllViewsOperationSignatureFactory({
    objectMetadataItem: objectMetadataItems.find(
      (item) => item.nameSingular === CoreObjectNameSingular.View,
    ),
  });

  const { records } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.View,
    filter: findAllViewsOperationSignature.variables.filter,
    recordGqlFields: findAllViewsOperationSignature.fields,
    skip: !currentUser || isWorkspaceSuspended,
  });

  const setPrefetchViewsState = useRecoilCallback(
    ({ set, snapshot }) =>
      (views: View[]) => {
        const existingViews = snapshot
          .getLoadable(prefetchViewsState)
          .getValue();

        if (!isDeeplyEqual(existingViews, views)) {
          set(prefetchViewsState, views);
        }
      },
    [],
  );

  const isPersistingViewFields = useRecoilValue(isPersistingViewFieldsState);

  useEffect(() => {
    if (isDefined(records) && !isPersistingViewFields) {
      setPrefetchViewsState(records as View[]);
    }
  }, [isPersistingViewFields, records, setPrefetchViewsState]);

  return <></>;
};
