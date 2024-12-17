import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-ui';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useReplaceBlockEditorContent = (
  activityId: string,
  editor: any,
) => {
  const replaceBlockEditorContent = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        if (isDefined(editor)) {
          const activityInStore = snapshot
            .getLoadable(recordStoreFamilyState(activityId))
            .getValue();

          const content = isNonEmptyString(activityInStore?.body)
            ? JSON.parse(activityInStore?.body)
            : [{ type: 'paragraph', content: '' }];

          console.log(editor.document, content);
          if (!isDeeplyEqual(editor.document, content)) {
            console.log('replacing');
            editor.replaceBlocks(editor.document, content);
          }
        }
      },
    [activityId, editor],
  );

  return {
    replaceBlockEditorContent,
  };
};
