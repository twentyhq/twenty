import { ReactNodeViewRenderer } from '@tiptap/react';

import { CampaignVariableChip } from '@/advanced-text-editor/extensions/campaign-variables/CampaignVariableChip';
import { VariableTag } from '@/workflow/workflow-variables/utils/variableTag';

// Same node name and stored JSON as the workflow variable tag, but with a
// standalone chip view: the workflow one resolves its label against workflow
// context and throws outside of it.
export const CampaignVariableTag = VariableTag.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CampaignVariableChip);
  },
});
