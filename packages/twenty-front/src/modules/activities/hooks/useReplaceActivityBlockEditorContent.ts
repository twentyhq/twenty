import { type BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useReplaceActivityBlockEditorContent = (
  editor: typeof BLOCK_SCHEMA.BlockNoteEditor,
) => {
  const replaceBlockEditorContent = useRecoilCallback(
    ({ snapshot }) =>
      (activityId: string) => {
        if (isDefined(editor)) {
          const activityInStore = snapshot
            .getLoadable(recordStoreFamilyState(activityId))
            .getValue();

          const content = isNonEmptyString(activityInStore?.bodyV2.blocknote)
            ? JSON.parse(activityInStore?.bodyV2.blocknote)
            : [{ type: 'paragraph', content: '' }];

          if (!isDeeplyEqual(editor.document, content)) {
            editor.replaceBlocks(editor.document, content);
          }
        }
      },
    [editor],
  );

  return {
    replaceBlockEditorContent,
  };
};
