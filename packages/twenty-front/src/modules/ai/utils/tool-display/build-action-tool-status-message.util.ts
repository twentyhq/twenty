import { i18n } from '@lingui/core';

import { ACTION_TOOL_STATUS_LABELS } from '@/ai/constants/action-tool-status-labels.constant';
import { buildGenericToolStatusMessage } from '@/ai/utils/tool-display/build-generic-tool-status-message.util';
import { pickStatusLabel } from '@/ai/utils/tool-display/pick-status-label.util';
import { type ToolDisplayContext } from '@/ai/types/tool-display-context.type';

export const buildActionToolStatusMessage = ({
  toolName,
  isFinished,
  displayContext,
}: {
  toolName: string;
  isFinished: boolean;
  displayContext: ToolDisplayContext;
}): string => {
  const label = displayContext.labelByName.get(toolName) ?? toolName;
  const statusLabels = ACTION_TOOL_STATUS_LABELS[toolName];

  if (statusLabels) {
    return pickStatusLabel({
      isFinished,
      loadingLabel: i18n._(statusLabels.loading),
      completedLabel: i18n._(statusLabels.completed),
    });
  }

  return buildGenericToolStatusMessage({ label, isFinished });
};
