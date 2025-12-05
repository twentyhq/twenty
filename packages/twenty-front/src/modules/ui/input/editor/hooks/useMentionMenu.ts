import { type BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { type MentionItem } from '@/ui/input/editor/components/types';
import { useCallback, useMemo, useState } from 'react';
import { useRecoilCallback } from 'recoil';
import { type SearchQuery } from '~/generated/graphql';

const MENTION_SEARCH_LIMIT = 50;

export const useMentionMenu = (editor: typeof BLOCK_SCHEMA.BlockNoteEditor) => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const [searchQuery, setSearchQuery] = useState('');

  const objectsToSearch = useMemo(
    () =>
      activeObjectMetadataItems
        .filter((item) => !item.isSystem && item.isSearchable)
        .map(({ nameSingular }) => nameSingular),
    [activeObjectMetadataItems],
  );

  const onSearchRecordsCompleted = useRecoilCallback(
    ({ set }) =>
      (data: SearchQuery) => {
        const searchRecords = data.search.edges.map((edge) => edge.node);

        searchRecords.forEach((searchRecord) => {
          set(searchRecordStoreFamilyState(searchRecord.recordId), {
            ...searchRecord,
            record: undefined,
          });
        });
      },
    [],
  );

  const { searchRecords } = useObjectRecordSearchRecords({
    objectNameSingulars: objectsToSearch,
    searchInput: searchQuery,
    limit: MENTION_SEARCH_LIMIT,
    skip: objectsToSearch.length === 0,
    onCompleted: onSearchRecordsCompleted,
  });

  const mentionItems: MentionItem[] = useMemo(
    () =>
      searchRecords.map((searchRecord) => ({
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
      })),
    [searchRecords, editor],
  );

  const getMentionItems = useCallback(
    async (query: string): Promise<MentionItem[]> => {
      setSearchQuery(query);
      return mentionItems;
    },
    [mentionItems],
  );

  return getMentionItems;
};
