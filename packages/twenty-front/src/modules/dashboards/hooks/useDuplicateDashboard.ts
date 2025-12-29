import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { DUPLICATE_DASHBOARD } from '@/dashboards/graphql/mutations/duplicateDashboard';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useMutation } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';

type DuplicateDashboardResult = {
  id: string;
  title: string | null;
  pageLayoutId: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export const useDuplicateDashboard = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Dashboard,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const createOneRecordInCache = useCreateOneRecordInCache({
    objectMetadataItem,
  });

  const [mutate] = useMutation<
    { duplicateDashboard: DuplicateDashboardResult },
    { id: string }
  >(DUPLICATE_DASHBOARD, {
    client: apolloCoreClient,
  });

  const duplicateDashboard = async (dashboardId: string) => {
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
  };

  return {
    duplicateDashboard,
  };
};
