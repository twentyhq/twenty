import { type BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { SEARCH_QUERY } from '@/command-menu/graphql/queries/search';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
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

  const objectsToSearch = useMemo(
    () =>
      activeObjectMetadataItems
        .filter((item) => !item.isSystem && item.isSearchable)
        .map(({ nameSingular }) => nameSingular),
    [activeObjectMetadataItems],
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

        return searchRecords.map((searchRecord) => ({
          title: searchRecord.label,
          recordId: searchRecord.recordId,
          objectNameSingular: searchRecord.objectNameSingular,
          onItemClick: () => {
            editor.insertInlineContent([
              {
                type: 'mention',
                props: {
                  recordId: searchRecord.recordId,
                  objectNameSingular: searchRecord.objectNameSingular,
                },
              },
              ' ',
            ]);
          },
        }));
      },
    [apolloCoreClient, editor, objectsToSearch],
  );

  return getMentionItems;
};
