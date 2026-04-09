import { type BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { type MentionItem } from '@/blocknote-editor/types/types';
import { useCallback } from 'react';

export const useMentionMenu = (editor: typeof BLOCK_SCHEMA.BlockNoteEditor) => {
  const { searchMentionRecords, searchableObjectMetadataItems } =
    useMentionSearch();

  const getMentionItems = useCallback(
    async (query: string): Promise<MentionItem[]> => {
      const results = await searchMentionRecords(query);

      return results.map((result) => {
        const objectMetadataItem = searchableObjectMetadataItems.find(
          (item) => item.nameSingular === result.objectNameSingular,
        );

        return {
          title: result.label,
          recordId: result.recordId,
          objectNameSingular: result.objectNameSingular,
          objectMetadataId: objectMetadataItem?.id,
          label: result.label,
          imageUrl: result.imageUrl,
          objectLabelSingular: result.objectLabelSingular,
          onItemClick: () => {
            editor.insertInlineContent([
              {
                type: 'mention',
                props: {
                  recordId: result.recordId,
                  objectMetadataId: objectMetadataItem?.id ?? '',
                  objectNameSingular: result.objectNameSingular,
                  label: result.label,
                  imageUrl: result.imageUrl,
                },
              },
              ' ',
            ]);
          },
        };
      });
    },
    [editor, searchMentionRecords, searchableObjectMetadataItems],
  );

  return getMentionItems;
};
