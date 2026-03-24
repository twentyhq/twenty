import { useCallback } from 'react';
import { useStore } from 'jotai';

import { type BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isNonEmptyString } from '@sniptt/guards';
import { parseJson } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const EMPTY_BLOCK_CONTENT = [{ type: 'paragraph', content: '' }];

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

      const parsed = isNonEmptyString(fieldValue?.blocknote)
        ? parseJson<unknown[]>(fieldValue.blocknote)
        : null;

      const content =
        Array.isArray(parsed) && parsed.length > 0
          ? parsed
          : EMPTY_BLOCK_CONTENT;

      if (!isDeeplyEqual(editor.document, content)) {
        editor.replaceBlocks(editor.document, content);
      }
    },
    [store, editor, fieldName],
  );

  return { replaceBlockEditorContent };
};
