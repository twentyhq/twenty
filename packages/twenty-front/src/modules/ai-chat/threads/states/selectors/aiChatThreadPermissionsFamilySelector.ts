import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadObjectMetadataItemSelector } from '@/ai-chat/threads/states/selectors/aiChatThreadObjectMetadataItemSelector';
import { recordPermissionsFamilySelector } from '@/object-record/record-sharing/states/recordPermissionsFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { type RecordPermissionsDto } from '~/generated-metadata/graphql';

export const aiChatThreadPermissionsFamilySelector = createAtomFamilySelector<
  RecordPermissionsDto | undefined,
  string
>({
  key: 'aiChatThreadPermissionsFamilySelector',
  get:
    (threadId) =>
    ({ get }) => {
      const aiChatThreadObjectMetadataItem = get(
        aiChatThreadObjectMetadataItemSelector,
      );
      return isDefined(aiChatThreadObjectMetadataItem)
        ? get(recordPermissionsFamilySelector, {
            objectMetadataId: aiChatThreadObjectMetadataItem.id,
            recordId: threadId,
          })
        : undefined;
    },
});
