import { type BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { SEARCH_QUERY } from '@/command-menu/graphql/queries/search';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { type MentionItem } from '@/ui/input/editor/components/types';
import { useMemo } from 'react';
import { useRecoilCallback } from 'recoil';
import {
  type SearchQuery,
  type SearchQueryVariables,
} from '~/generated/graphql';

const MENTION_SEARCH_LIMIT = 50;

export const useMentionMenu = (editor: typeof BLOCK_SCHEMA.BlockNoteEditor) => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const apolloCoreClient = useApolloCoreClient();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const searchableObjectMetadataItems = useMemo(
    () =>
      activeObjectMetadataItems.filter(
        (item) =>
          !item.isSystem &&
          item.isSearchable &&
          getObjectPermissionsFromMapByObjectMetadataId({
            objectPermissionsByObjectMetadataId,
            objectMetadataId: item.id,
          }).canReadObjectRecords === true,
      ),
    [activeObjectMetadataItems, objectPermissionsByObjectMetadataId],
  );

  const objectsToSearch = useMemo(
    () => searchableObjectMetadataItems.map(({ nameSingular }) => nameSingular),
    [searchableObjectMetadataItems],
  );

  const getMentionItems = useRecoilCallback(
    ({ set }) =>
      async (query: string): Promise<MentionItem[]> => {
        const { data } = await apolloCoreClient.query<
          SearchQuery,
          SearchQueryVariables
        >({
          query: SEARCH_QUERY,
          variables: {
            searchInput: query,
            limit: MENTION_SEARCH_LIMIT,
            includedObjectNameSingulars: objectsToSearch,
          },
        });

        const searchRecords = data?.search.edges.map((edge) => edge.node) || [];

        searchRecords.forEach((searchRecord) => {
          set(searchRecordStoreFamilyState(searchRecord.recordId), {
            ...searchRecord,
            record: undefined,
          });
        });

        return searchRecords.map((searchRecord) => {
          const objectMetadataItem = searchableObjectMetadataItems.find(
            (item) => item.nameSingular === searchRecord.objectNameSingular,
          );

          return {
            title: searchRecord.label,
            recordId: searchRecord.recordId,
            objectNameSingular: searchRecord.objectNameSingular,
            objectMetadataId: objectMetadataItem?.id,
            onItemClick: () => {
              editor.insertInlineContent([
                {
                  type: 'mention',
                  props: {
                    recordId: searchRecord.recordId,
                    objectMetadataId: objectMetadataItem?.id ?? '',
                  },
                },
                ' ',
              ]);
            },
          };
        });
      },
    [apolloCoreClient, editor, objectsToSearch, searchableObjectMetadataItems],
  );

  return getMentionItems;
};
