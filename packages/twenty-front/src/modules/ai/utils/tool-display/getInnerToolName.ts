import { getToolOutputLabelEntries } from '@/ai/utils/getToolOutputLabelEntries';
import { isDefined } from 'twenty-shared/utils';

export const getInnerToolName = ({
  toolName,
  labelByName,
  output,
}: {
  toolName: string;
  labelByName: Map<string, string>;
  output?: unknown;
}): string => {
  const indexLabel = labelByName.get(toolName);

  if (isDefined(indexLabel)) {
    return indexLabel;
  }

  const outputEntry = getToolOutputLabelEntries(output).find(
    (entry) => entry.name === toolName,
  );

  return outputEntry?.label ?? toolName;
};
