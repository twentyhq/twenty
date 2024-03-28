import { ApolloClient } from '@apollo/client';

import { CachedObjectRecordConnection } from '@/apollo/types/CachedObjectRecordConnection';
import { getCacheReferenceFromRecord } from '@/object-record/cache/utils/getCacheReferenceFromRecord';
import { getConnectionTypename } from '@/object-record/cache/utils/getConnectionTypename';
import { getEmptyPageInfo } from '@/object-record/cache/utils/getEmptyPageInfo';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getReferenceRecordConnectionFromRecords = <
  T extends ObjectRecord,
>({
  apolloClient,
  objectNameSingular,
  records,
  withPageInfo = true,
}: {
  apolloClient: ApolloClient<any>;
  objectNameSingular: string;
  records: T[];
  withPageInfo?: boolean;
}) => {
  return {
    __typename: getConnectionTypename({ objectNameSingular }),
    edges: records.map((record) => {
      return {
        node: getCacheReferenceFromRecord({
          apolloClient,
          objectNameSingular,
          record,
        }),
      };
    }),
    ...(withPageInfo && { pageInfo: getEmptyPageInfo() }),
    ...(withPageInfo && { totalCount: records.length }),
  } as CachedObjectRecordConnection;
};
