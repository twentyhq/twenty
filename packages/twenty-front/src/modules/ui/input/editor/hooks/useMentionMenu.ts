import { type BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { useCombinedFindManyRecords } from '@/object-record/multiple-objects/hooks/useCombinedFindManyRecords';
import { type MentionItem } from '@/ui/input/editor/components/types';
import { useMemo } from 'react';

export const useMentionMenu = (editor: typeof BLOCK_SCHEMA.BlockNoteEditor) => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  // Get non-system objects to fetch records for
  const objectsToFetch = useMemo(
    () => activeObjectMetadataItems.filter((item) => !item.isSystem),
    [activeObjectMetadataItems],
  );

  // Create operation signatures for combined query
  const operationSignatures = useMemo(
    () =>
      objectsToFetch.map((objectMetadataItem) => ({
        objectNameSingular: objectMetadataItem.nameSingular,
        variables: {
          filter: {},
          orderBy: [{ createdAt: 'DescNullsLast' }] as any,
          limit: 5,
        },
      })),
    [objectsToFetch],
  );

  // Fetch records from all objects in a single combined query
  const { result: allRecordsByType, loading } = useCombinedFindManyRecords({
    operationSignatures,
    skip: operationSignatures.length === 0,
  });

  const mentionItems: MentionItem[] = useMemo(() => {
    if (loading || !allRecordsByType) {
      return [];
    }

    const allItems: MentionItem[] = [];

    Object.entries(allRecordsByType).forEach(([namePlural, records]) => {
      const objectMetadataItem = objectsToFetch.find(
        (item) => item.namePlural === namePlural,
      );

      if (!objectMetadataItem || !records) {
        return;
      }

      const objectNameSingular = objectMetadataItem.nameSingular;
      const labelIdentifierFieldMetadataItem =
        getLabelIdentifierFieldMetadataItem(objectMetadataItem);

      records.forEach((record) => {
        const name = getLabelIdentifierFieldValue(
          record,
          labelIdentifierFieldMetadataItem,
          objectNameSingular,
        );

        allItems.push({
          title: name,
          record,
          name,
          objectNameSingular,
          onItemClick: () => {
            editor.insertInlineContent([
              {
                type: 'mention',
                props: {
                  recordId: record.id,
                  objectNameSingular,
                },
              },
              ' ',
            ]);
          },
        });
      });
    });

    return allItems;
  }, [allRecordsByType, loading, objectsToFetch, editor]);

  return mentionItems;
};
