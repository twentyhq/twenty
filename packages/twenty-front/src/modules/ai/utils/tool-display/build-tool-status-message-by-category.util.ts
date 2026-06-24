import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type ToolDisplayContext } from '@/ai/types/tool-display-context.type';
import { buildActionToolStatusMessage } from '@/ai/utils/tool-display/build-action-tool-status-message.util';
import { buildCrudToolStatusMessage } from '@/ai/utils/tool-display/build-crud-tool-status-message.util';
import { buildGenericToolStatusMessage } from '@/ai/utils/tool-display/build-generic-tool-status-message.util';
import { parseCrudToolName } from '@/ai/utils/tool-display/parse-crud-tool-name.util';

export const buildToolStatusMessageByCategory = ({
  toolName,
  isFinished,
  displayContext,
}: {
  toolName: string;
  isFinished: boolean;
  displayContext: ToolDisplayContext;
}): string => {
  const indexEntry = displayContext.indexByName.get(toolName);
  const category = indexEntry?.category;
  const isCrudTool =
    category === ToolCategory.DATABASE_CRUD ||
    isDefined(parseCrudToolName(toolName));

  if (isCrudTool) {
    const crudMessage = buildCrudToolStatusMessage({
      toolName,
      isFinished,
      displayContext,
    });

    if (isDefined(crudMessage)) {
      return crudMessage;
    }
  }

  if (category === ToolCategory.ACTION) {
    return buildActionToolStatusMessage({
      toolName,
      isFinished,
      displayContext,
    });
  }

  const label = displayContext.labelByName.get(toolName) ?? toolName;

  return buildGenericToolStatusMessage({ label, isFinished });
};
