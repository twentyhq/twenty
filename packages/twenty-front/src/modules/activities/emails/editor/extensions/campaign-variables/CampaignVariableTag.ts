import { ReactNodeViewRenderer } from '@tiptap/react';

import { CampaignVariableChip } from '@/activities/emails/editor/extensions/campaign-variables/CampaignVariableChip';
import { VariableTag } from '@/advanced-text-editor/extensions/variable-tag/VariableTag';

export const CampaignVariableTag = VariableTag.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CampaignVariableChip);
  },
});
