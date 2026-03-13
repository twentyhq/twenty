import { useCallback } from 'react';
import { useStore } from 'jotai';

import { type BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isNonEmptyString } from '@sniptt/guards';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useReplaceBlockEditorContent = (
  editor: typeof BLOCK_SCHEMA.BlockNoteEditor,
  fieldName: string,
) => {
  const store = useStore();

  const replaceBlockEditorContent = useCallback(
    (recordId: string) => {
      if (!editor) return;

      const record = store.get(recordStoreFamilyState.atomFamily(recordId));

      const fieldValue = record?.[fieldName] as
        | { blocknote?: string | null }
        | undefined;

      const content = isNonEmptyString(fieldValue?.blocknote)
        ? JSON.parse(fieldValue.blocknote)
        : [{ type: 'paragraph', content: '' }];

      if (!isDeeplyEqual(editor.document, content)) {
        editor.replaceBlocks(editor.document, content);
      }
    },
    [store, editor, fieldName],
  );

  return { replaceBlockEditorContent };
};
