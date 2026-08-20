import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular, CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DuplicateDashboardDocument } from '~/generated-metadata/graphql';

export const useDuplicateDashboard = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Dashboard,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const createOneRecordInCache = useCreateOneRecordInCache({
    objectMetadataItem,
  });

  const [mutate] = useMutation(DuplicateDashboardDocument);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const duplicateDashboard = async (dashboardId: string) => {
    try {
      const result = await mutate({
        variables: { id: dashboardId },
        update: (cache, { data }) => {
          const record = data?.duplicateDashboard;

          if (!isDefined(record)) return;

          const createdRecord: ObjectRecord = {
            ...record,
            __typename: getObjectTypename(CoreObjectNameSingular.Dashboard),
          };

          createOneRecordInCache(createdRecord);

          const recordNode = getRecordNodeFromRecord({
            objectMetadataItem,
            objectMetadataItems,
            record: createdRecord,
            computeReferences: false,
          });

          if (isDefined(recordNode)) {
            triggerCreateRecordsOptimisticEffect({
              cache,
              objectMetadataItem,
              recordsToCreate: [recordNode],
              objectMetadataItems,
              objectPermissionsByObjectMetadataId,
              upsertRecordsInStore,
            });
          }
        },
      });

      return result?.data?.duplicateDashboard;
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        handleMetadataError(error, {
          primaryMetadataName: 'pageLayoutWidget',
          operationType: CrudOperationType.CREATE,
        });
      } else {
        enqueueErrorSnackBar({ message: t`Failed to duplicate dashboard` });
      }

      return undefined;
    }
  };

  return {
    duplicateDashboard,
  };
};
