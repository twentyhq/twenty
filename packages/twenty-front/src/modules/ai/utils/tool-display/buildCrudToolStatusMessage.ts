import { i18n } from '@lingui/core';

import { CRUD_TOOL_OPERATION_VERBS } from '@/ai/constants/CrudToolOperationVerbs';
import { type ToolDisplayContext } from '@/ai/types/ToolDisplayContext';
import { getObjectLabelForCrudOperation } from '@/ai/utils/tool-display/getObjectLabelForCrudOperation';
import { parseCrudToolName } from '@/ai/utils/tool-display/parseCrudToolName';
import { pickStatusLabel } from '@/ai/utils/tool-display/pickStatusLabel';
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

  const loadingDescriptor = { ...verbs.loading, values: { objectLabel } };
  const completedDescriptor = { ...verbs.completed, values: { objectLabel } };

  return pickStatusLabel({
    isFinished,
    loadingLabel: i18n._(loadingDescriptor),
    completedLabel: i18n._(completedDescriptor),
  });
};
