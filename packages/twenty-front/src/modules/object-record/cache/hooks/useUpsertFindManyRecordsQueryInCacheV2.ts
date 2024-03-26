import { useApolloClient } from '@apollo/client';
import { print } from 'graphql';
import { useRecoilCallback } from 'recoil';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { useGenerateFindManyRecordsQuery } from '@/object-record/hooks/useGenerateFindManyRecordsQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export const useUpsertFindManyRecordsQueryInCacheV2 = ({
  objectMetadataItem,
}: {
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'namePlural' | 'nameSingular'
  >;
}) => {
  const apolloClient = useApolloClient();

  const generateFindManyRecordsQuery = useGenerateFindManyRecordsQuery();

  const upsertFindManyRecordsQueryInCache = useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends ObjectRecord = ObjectRecord>({
        queryVariables,
        objectRecordsToOverwrite,
        eagerLoadedRelations,
        queryFields,
      }: {
        queryVariables: ObjectRecordQueryVariables;
        objectRecordsToOverwrite: T[];
        eagerLoadedRelations?: Record<string, any>;
        queryFields?: Record<string, any>;
      }) => {
        const findManyRecordsQueryForCacheOverwrite =
          generateFindManyRecordsQuery({
            objectMetadataItem,
            depth: 1,
            eagerLoadedRelations,
            queryFields,
          });

        const newObjectRecordConnection = getRecordConnectionFromRecords({
          objectNameSingular: objectMetadataItem.nameSingular,
          records: objectRecordsToOverwrite,
        });

        console.log({
          query: print(findManyRecordsQueryForCacheOverwrite),
          data: newObjectRecordConnection,
        });

        apolloClient.writeQuery({
          query: findManyRecordsQueryForCacheOverwrite,
          variables: queryVariables,
          data: {
            [objectMetadataItem.namePlural]: newObjectRecordConnection,
          },
        });

        // TODO: remove this when removing record store
        // for (const objectRecordToOverwrite of objectRecordsToOverwrite) {
        //   console.log({
        //     objectRecordToOverwrite,
        //   });
        //   set(
        //     recordStoreFamilyState(objectRecordToOverwrite.id),
        //     objectRecordToOverwrite,
        //   );
        // }
      },
    [apolloClient, generateFindManyRecordsQuery, objectMetadataItem],
  );

  return {
    upsertFindManyRecordsQueryInCache,
  };
};
