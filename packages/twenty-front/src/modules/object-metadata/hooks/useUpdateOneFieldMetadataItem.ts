import { useApolloClient, useMutation } from '@apollo/client';

import {
  UpdateOneFieldMetadataItemMutation,
  UpdateOneFieldMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { UPDATE_ONE_FIELD_METADATA_ITEM } from '../graphql/mutations';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { useSetRecoilState } from 'recoil';

import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateOneFieldMetadataItem = () => {
  const apolloClient = useApolloClient();
  const apolloCoreClient = useApolloCoreClient();
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const { setRecordGroupsFromViewGroups } = useSetRecordGroups();
  const cache = useApolloClient().cache;

  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);

  const { findManyRecordsQuery: findManyViewsQuery } = useFindManyRecordsQuery({
    objectNameSingular: CoreObjectNameSingular.View,
    recordGqlFields: {
      id: true,
      viewGroups: {
        id: true,
        fieldMetadataId: true,
        isVisible: true,
        fieldValue: true,
        position: true,
      },
    },
  });

  const [mutate] = useMutation<
    UpdateOneFieldMetadataItemMutation,
    UpdateOneFieldMetadataItemMutationVariables
  >(UPDATE_ONE_FIELD_METADATA_ITEM);

  const updateOneFieldMetadataItem = async ({
    objectMetadataId,
    fieldMetadataIdToUpdate,
    updatePayload,
  }: {
    objectMetadataId: string;
    fieldMetadataIdToUpdate: UpdateOneFieldMetadataItemMutationVariables['idToUpdate'];
    updatePayload: Pick<
      UpdateOneFieldMetadataItemMutationVariables['updatePayload'],
      | 'description'
      | 'icon'
      | 'isActive'
      | 'label'
      | 'name'
      | 'defaultValue'
      | 'options'
      | 'isLabelSyncedWithName'
    >;
  }) => {
    const result = await mutate({
      variables: {
        idToUpdate: fieldMetadataIdToUpdate,
        updatePayload: updatePayload,
      },
    });

    const objectMetadataItemsRefreshed = await refreshObjectMetadataItems();

    const { data } = await apolloClient.query({ query: GET_CURRENT_USER });
    setCurrentWorkspace(data?.currentUser?.currentWorkspace);

    const { data: viewConnection } = await apolloCoreClient.query<{
      views: RecordGqlConnection;
    }>({
      query: findManyViewsQuery,
      variables: {
        filter: {
          objectMetadataId: {
            eq: objectMetadataId,
          },
        },
      },
      fetchPolicy: 'network-only',
    });

    const viewRecords = getRecordsFromRecordConnection({
      recordConnection: viewConnection?.views,
    });

    for (const view of viewRecords) {
      const correspondingObjectMetadataItemRefreshed =
        objectMetadataItemsRefreshed?.find(
          (item) => item.id === objectMetadataId,
        );

      if (isDefined(correspondingObjectMetadataItemRefreshed)) {
        setRecordGroupsFromViewGroups(
          view.id,
          view.viewGroups,
          correspondingObjectMetadataItemRefreshed,
        );
      }
      cache.evict({ id: `Views:${view.id}` });
    }

    return result;
  };

  return {
    updateOneFieldMetadataItem,
  };
};
