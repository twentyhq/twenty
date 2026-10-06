import { type ToolDisplayContext } from '@/ai/types/ToolDisplayContext';
import { formatDisplayList } from '@/ai/utils/tool-display/formatDisplayList';
import { getInnerToolName } from '@/ai/utils/tool-display/getInnerToolName';
import { pickStatusLabel } from '@/ai/utils/tool-display/pickStatusLabel';

export const buildNamedItemsStatusMessage = ({
  names,
  isFinished,
  displayContext,
  output,
  loadingLabel,
  completedLabel,
  loadingFallback,
  completedFallback,
}: {
  names: string[];
  isFinished: boolean;
  displayContext: ToolDisplayContext;
  output?: unknown;
  loadingLabel: (formattedNames: string) => string;
  completedLabel: (formattedNames: string) => string;
  loadingFallback: string;
  completedFallback: string;
}): string => {
  if (names.length === 0) {
    return pickStatusLabel({
      isFinished,
      loadingLabel: loadingFallback,
      completedLabel: completedFallback,
    });
  }

  const labels = names.map((name) =>
    getInnerToolName({
      toolName: name,
      labelByName: displayContext.labelByName,
      output,
    }),
  );

  const formattedNames = formatDisplayList(labels);

  return pickStatusLabel({
    isFinished,
    loadingLabel: loadingLabel(formattedNames),
    completedLabel: completedLabel(formattedNames),
  });
};
