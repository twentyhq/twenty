import type { JSONContent } from '@tiptap/react';

import { type SearchRecord } from '~/generated/graphql';

export const getMentionTagContent = ({
  recordId,
  objectNameSingular,
  label,
  imageUrl,
}: Pick<
  SearchRecord,
  'recordId' | 'objectNameSingular' | 'label' | 'imageUrl'
>): JSONContent[] => [
  {
    type: 'mentionTag',
    attrs: {
      recordId,
      objectNameSingular,
      label,
      imageUrl: imageUrl ?? '',
    },
  },
  { type: 'text', text: ' ' },
];
