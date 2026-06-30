import { type ToolDisplayContext } from '@/ai/types/tool-display-context.type';
import { formatDisplayList } from '@/ai/utils/tool-display/format-display-list.util';
import { getInnerToolName } from '@/ai/utils/tool-display/get-inner-tool-name.util';
import { pickStatusLabel } from '@/ai/utils/tool-display/pick-status-label.util';

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
