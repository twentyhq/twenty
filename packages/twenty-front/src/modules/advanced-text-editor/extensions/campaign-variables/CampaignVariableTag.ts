import { ReactNodeViewRenderer } from '@tiptap/react';

import { CampaignVariableChip } from '@/advanced-text-editor/extensions/campaign-variables/CampaignVariableChip';
import { VariableTag } from '@/workflow/workflow-variables/utils/variableTag';

export const CampaignVariableTag = VariableTag.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CampaignVariableChip);
  },
});
