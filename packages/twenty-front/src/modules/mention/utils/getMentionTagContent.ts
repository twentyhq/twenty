import type { JSONContent } from '@tiptap/react';

import { type SearchRecord } from '~/generated/graphql';

export const getMentionTagContent = ({
  recordId,
  objectNameSingular,
  label,
  imageUrl,
  isConversationTarget = false,
}: Pick<
  SearchRecord,
  'recordId' | 'objectNameSingular' | 'label' | 'imageUrl'
> & { isConversationTarget?: boolean }): JSONContent[] => [
  {
    type: 'mentionTag',
    attrs: {
      recordId,
      objectNameSingular,
      label,
      imageUrl: imageUrl ?? '',
      isConversationTarget,
    },
  },
  { type: 'text', text: ' ' },
];
