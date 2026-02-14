import { type BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { type MentionItem } from '@/ui/input/editor/components/types';
import { useRecoilCallback } from 'recoil';

export const useMentionMenu = (editor: typeof BLOCK_SCHEMA.BlockNoteEditor) => {
  const { searchMentionRecords, searchableObjectMetadataItems } =
    useMentionSearch();

  const getMentionItems = useRecoilCallback(
    ({ set }) =>
      async (query: string): Promise<MentionItem[]> => {
        const results = await searchMentionRecords(query);

        // Populate the Recoil store for BlockNote's CustomMentionMenuListItem
        results.forEach((result) => {
          set(searchRecordStoreFamilyState(result.recordId), {
            recordId: result.recordId,
            objectNameSingular: result.objectNameSingular,
            objectLabelSingular: result.objectLabelSingular,
            label: result.label,
            imageUrl: result.imageUrl,
            tsRankCD: 0,
            tsRank: 0,
            record: undefined,
          });
        });

        return results.map((result) => {
          const objectMetadataItem = searchableObjectMetadataItems.find(
            (item) => item.nameSingular === result.objectNameSingular,
          );

          return {
            title: result.label,
            recordId: result.recordId,
            objectNameSingular: result.objectNameSingular,
            objectMetadataId: objectMetadataItem?.id,
            onItemClick: () => {
              editor.insertInlineContent([
                {
                  type: 'mention',
                  props: {
                    recordId: result.recordId,
                    objectMetadataId: objectMetadataItem?.id ?? '',
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
