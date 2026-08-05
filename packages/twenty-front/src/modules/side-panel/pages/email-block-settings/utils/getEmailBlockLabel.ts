import { t } from '@lingui/core/macro';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export const getEmailBlockLabel = (nodeType: string): string => {
  switch (nodeType) {
    case TIPTAP_NODE_TYPES.SECTION:
      return t`Section`;
    case TIPTAP_NODE_TYPES.COLUMNS:
      return t`Columns`;
    case TIPTAP_NODE_TYPES.COLUMN:
      return t`Column`;
    case TIPTAP_NODE_TYPES.BUTTON:
      return t`Button`;
    case TIPTAP_NODE_TYPES.DIVIDER:
      return t`Divider`;
    case TIPTAP_NODE_TYPES.HTML:
      return t`HTML`;
    case TIPTAP_NODE_TYPES.IMAGE:
      return t`Image`;
    default:
      return nodeType;
  }
};
