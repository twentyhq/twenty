import { useCallback } from 'react';
import { useStore } from 'jotai';

import { BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { readStoredBlocknote } from '@/blocknote-editor/utils/readStoredBlocknote';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useReplaceBlockEditorContent = (
  editor: typeof BLOCK_SCHEMA.BlockNoteEditor,
  fieldName: string,
) => {
  const store = useStore();

  const replaceBlockEditorContent = useCallback(
    (recordId: string) => {
      const record = store.get(recordStoreFamilyState.atomFamily(recordId));

      const fieldValue = record?.[fieldName] as
        | { blocknote?: string | null }
        | undefined;

      const { blocks } = readStoredBlocknote(fieldValue?.blocknote);

      const content = blocks ?? [{ type: 'paragraph' as const, content: '' }];

      if (!isDeeplyEqual(editor.document, content as typeof editor.document)) {
        editor.replaceBlocks(
          editor.document,
          content as typeof editor.document,
        );
      }
    },
    [store, editor, fieldName],
  );

  return { replaceBlockEditorContent };
};
