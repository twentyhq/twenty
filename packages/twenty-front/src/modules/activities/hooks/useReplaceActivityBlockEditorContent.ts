import { useCallback } from 'react';
import { useStore } from 'jotai';

import { type BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useReplaceActivityBlockEditorContent = (
  editor: typeof BLOCK_SCHEMA.BlockNoteEditor,
) => {
  const store = useStore();
  const replaceBlockEditorContent = useCallback(
    (activityId: string) => {
      if (isDefined(editor)) {
        const activityInStore = store.get(
          recordStoreFamilyState.atomFamily(activityId),
        );

        const content = isNonEmptyString(activityInStore?.bodyV2.blocknote)
          ? JSON.parse(activityInStore?.bodyV2.blocknote)
          : [{ type: 'paragraph', content: '' }];

        if (!isDeeplyEqual(editor.document, content)) {
          editor.replaceBlocks(editor.document, content);
        }
      }
    },
    [store, editor],
  );

  return {
    replaceBlockEditorContent,
  };
};
