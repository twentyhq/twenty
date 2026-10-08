import type { JSONContent } from '@tiptap/react';

import { type SearchRecord } from '~/generated/graphql';

export const getMentionTagContent = ({
  recordId,
  objectNameSingular,
  label,
  imageUrl,
  isConversationTarget = false,
  shouldAddAsParticipant = false,
}: Pick<
  SearchRecord,
  'recordId' | 'objectNameSingular' | 'label' | 'imageUrl'
> & {
  isConversationTarget?: boolean;
  shouldAddAsParticipant?: boolean;
}): JSONContent[] => [
  {
    type: 'mentionTag',
    attrs: {
      recordId,
      objectNameSingular,
      label,
      imageUrl: imageUrl ?? '',
      isConversationTarget,
      shouldAddAsParticipant,
    },
  },
  { type: 'text', text: ' ' },
];
