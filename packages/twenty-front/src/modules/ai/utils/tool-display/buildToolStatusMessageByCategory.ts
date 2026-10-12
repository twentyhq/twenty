import { i18n } from '@lingui/core';
import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { ACTION_TOOL_STATUS_LABELS } from '@/ai/constants/ActionToolStatusLabels';
import { type ToolDisplayContext } from '@/ai/types/ToolDisplayContext';
import { buildCrudToolStatusMessage } from '@/ai/utils/tool-display/buildCrudToolStatusMessage';
import { buildGenericToolStatusMessage } from '@/ai/utils/tool-display/buildGenericToolStatusMessage';
import { pickStatusLabel } from '@/ai/utils/tool-display/pickStatusLabel';

export const buildToolStatusMessageByCategory = ({
  toolName,
  isFinished,
  displayContext,
}: {
  toolName: string;
  isFinished: boolean;
  displayContext: ToolDisplayContext;
}): string => {
  const crudMessage = buildCrudToolStatusMessage({
    toolName,
    isFinished,
    displayContext,
  });

  if (isDefined(crudMessage)) {
    return crudMessage;
  }

  const actionStatusLabels =
    displayContext.indexByName.get(toolName)?.category === ToolCategory.ACTION
      ? ACTION_TOOL_STATUS_LABELS[toolName]
      : undefined;

  if (isDefined(actionStatusLabels)) {
    return pickStatusLabel({
      isFinished,
      loadingLabel: i18n._(actionStatusLabels.loading),
      completedLabel: i18n._(actionStatusLabels.completed),
    });
  }

  const label = displayContext.labelByName.get(toolName) ?? toolName;

  return buildGenericToolStatusMessage({ label, isFinished });
};
