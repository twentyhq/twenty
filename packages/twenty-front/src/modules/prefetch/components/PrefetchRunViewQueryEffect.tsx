import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { PREFETCH_CONFIG } from '@/prefetch/constants/PrefetchConfig';
import { findAllViewsOperationSignatureFactory } from '@/prefetch/graphql/operation-signatures/factories/findAllViewsOperationSignatureFactory';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { View } from '@/views/types/View';
import { useIsWorkspaceActivationStatusSuspended } from '@/workspace/hooks/useIsWorkspaceActivationStatusSuspended';
import { isDefined } from 'twenty-shared';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const PrefetchRunViewQueryEffect = () => {
  console.log('PrefetchRunQueriesEffect');
  const currentUser = useRecoilValue(currentUserState);

  const isWorkspaceSuspended = useIsWorkspaceActivationStatusSuspended();

  const { objectMetadataItems } = useObjectMetadataItems();

  const operationSignatures = Object.values(PREFETCH_CONFIG)

    .map(({ objectNameSingular, operationSignatureFactory }) => {
      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === objectNameSingular,
      );

      return operationSignatureFactory({ objectMetadataItem });
    });

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

  useEffect(() => {
    if (isDefined(records)) {
      setPrefetchViewsState(records as View[]);
    }
  }, [records, setPrefetchViewsState]);

  return <></>;
};
