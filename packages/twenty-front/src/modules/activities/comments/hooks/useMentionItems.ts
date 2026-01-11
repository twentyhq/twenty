import { useCallback, useMemo } from 'react';

import { type CommentEditor } from '@/activities/comments/constants/CommentSchema';
import { type MentionSuggestionItem } from '@/activities/comments/components/MentionSuggestionMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';

type UseMentionItemsProps = {
  editor: CommentEditor;
  searchInput: string;
};

export const useMentionItems = ({
  editor,
  searchInput,
}: UseMentionItemsProps): {
  items: MentionSuggestionItem[];
  loading: boolean;
} => {
  const { searchRecords, loading } = useObjectRecordSearchRecords({
    objectNameSingulars: [CoreObjectNameSingular.WorkspaceMember],
    searchInput: searchInput || '',
    limit: 10,
    skip: !searchInput && searchInput !== '',
  });

  const insertMention = useCallback(
    (recordId: string, label: string) => {
      editor.insertInlineContent([
        {
          type: 'mention',
          props: {
            userId: recordId,
            name: label,
          },
        },
        ' ',
      ]);
    },
    [editor],
  );

  const items = useMemo(() => {
    return searchRecords.map((searchRecord) => {
      return {
        id: searchRecord.recordId,
        title: searchRecord.label,
        avatarUrl: searchRecord.imageUrl,
        onItemClick: () => insertMention(searchRecord.recordId, searchRecord.label),
      };
    });
  }, [searchRecords, insertMention]);

  return {
    items,
    loading,
  };
};
