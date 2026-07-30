import { t } from '@lingui/core/macro';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export const getCampaignBlockLabel = (nodeType: string): string => {
  switch (nodeType) {
    case TIPTAP_NODE_TYPES.EMAIL_SECTION:
      return t`Section`;
    case TIPTAP_NODE_TYPES.EMAIL_COLUMNS:
      return t`Columns`;
    case TIPTAP_NODE_TYPES.EMAIL_COLUMN:
      return t`Column`;
    case TIPTAP_NODE_TYPES.EMAIL_BUTTON:
      return t`Button`;
    case TIPTAP_NODE_TYPES.EMAIL_DIVIDER:
      return t`Divider`;
    case TIPTAP_NODE_TYPES.EMAIL_HTML:
      return t`HTML`;
    default:
      return nodeType;
  }
};
