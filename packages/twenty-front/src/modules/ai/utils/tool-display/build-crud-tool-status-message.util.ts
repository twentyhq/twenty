import { i18n } from '@lingui/core';

import { CRUD_TOOL_OPERATION_VERBS } from '@/ai/constants/crud-tool-operation-verbs.constant';
import { type ToolDisplayContext } from '@/ai/types/tool-display-context.type';
import { getObjectLabelForCrudOperation } from '@/ai/utils/tool-display/get-object-label-for-crud-operation.util';
import { parseCrudToolName } from '@/ai/utils/tool-display/parse-crud-tool-name.util';
import { pickStatusLabel } from '@/ai/utils/tool-display/pick-status-label.util';
import { isDefined } from 'twenty-shared/utils';

export const buildCrudToolStatusMessage = ({
  toolName,
  isFinished,
  displayContext,
}: {
  toolName: string;
  isFinished: boolean;
  displayContext: ToolDisplayContext;
}): string | null => {
  const parsedCrudToolName = parseCrudToolName(toolName);

  if (!parsedCrudToolName) {
    return null;
  }

  const indexEntry = displayContext.indexByName.get(toolName);
  const objectLabel = getObjectLabelForCrudOperation({
    operation: parsedCrudToolName.operation,
    objectName: indexEntry?.objectName,
    objectSlug: parsedCrudToolName.objectSlug,
    objectMetadataItems: displayContext.objectMetadataItems,
  });
  const verbs = CRUD_TOOL_OPERATION_VERBS[parsedCrudToolName.operation];

  if (!isDefined(objectLabel)) {
    return null;
  }

  return pickStatusLabel({
    isFinished,
    loadingLabel: i18n._({ ...verbs.loading, values: { objectLabel } }),
    completedLabel: i18n._({ ...verbs.completed, values: { objectLabel } }),
  });
};
