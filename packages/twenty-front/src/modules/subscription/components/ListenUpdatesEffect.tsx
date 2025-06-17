import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useOnDbEvent } from '@/subscription/hooks/useOnDbEvent';
import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { DatabaseEventAction } from '~/generated/graphql';

type ListenRecordUpdatesEffectProps = {
  objectNameSingular: string;
  recordId: string;
  listenedFields: string[];
};

export const ListenRecordUpdatesEffect = ({
  objectNameSingular,
  recordId,
  listenedFields,
}: ListenRecordUpdatesEffectProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const computedRecordGqlFields = generateDepthOneRecordGqlFields({
    objectMetadataItem,
  });

  const setRecordInStore = useRecoilCallback(
    ({ set }) =>
      ({ recordId, record }: { recordId: string; record: ObjectRecord }) => {
        set(recordStoreFamilyState(recordId), record);
      },
    [],
  );

  useOnDbEvent({
    input: { recordId, action: DatabaseEventAction.UPDATED },
    onData: (data) => {
      const updatedRecord = data.onDbEvent.record;

      const cachedRecord = getRecordFromCache<ObjectRecord>(recordId);

      const cachedRecordWithConnection = getRecordNodeFromRecord<ObjectRecord>({
        record: cachedRecord,
        objectMetadataItem,
        objectMetadataItems,
        recordGqlFields: computedRecordGqlFields,
        computeReferences: false,
      });

      const computedOptimisticRecord = {
        ...cachedRecord,
        ...updatedRecord,
        id: recordId,
        __typename: getObjectTypename(objectMetadataItem.nameSingular),
      };

      const optimisticRecordWithConnection =
        getRecordNodeFromRecord<ObjectRecord>({
          record: updatedRecord,
          objectMetadataItem,
          objectMetadataItems,
          recordGqlFields: computedRecordGqlFields,
          computeReferences: false,
        });

      updateRecordFromCache({
        objectMetadataItems,
        objectMetadataItem,
        cache: apolloClient.cache,
        record: computedOptimisticRecord,
        recordGqlFields: computedRecordGqlFields,
        objectPermissionsByObjectMetadataId,
      });

      setRecordInStore({
        recordId,
        record: computedOptimisticRecord,
      });

      if (
        isDefined(cachedRecordWithConnection) &&
        isDefined(optimisticRecordWithConnection)
      ) {
        triggerUpdateRecordOptimisticEffect({
          cache: apolloClient.cache,
          objectMetadataItem,
          currentRecord: computedOptimisticRecord,
          updatedRecord: updatedRecord,
          objectMetadataItems,
        });
      }
    },
    skip: listenedFields.length === 0,
  });

  return null;
};
