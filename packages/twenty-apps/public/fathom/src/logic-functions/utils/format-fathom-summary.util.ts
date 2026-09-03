import { type ActionItem } from 'fathom-typescript/sdk/models/shared';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

const formatActionItem = (actionItem: ActionItem): string => {
  const completionMarker = actionItem.completed ? 'x' : ' ';
  const assigneeName = actionItem.assignee.name?.trim();
  const assigneeSuffix = isNonEmptyString(assigneeName)
    ? ` — ${assigneeName}`
    : '';

  return `- [${completionMarker}] ${actionItem.description}${assigneeSuffix}`;
};

export const formatFathomSummary = ({
  summaryMarkdown,
  actionItems,
}: {
  summaryMarkdown: string | null | undefined;
  actionItems: ActionItem[] | null | undefined;
}): string => {
  const sections: string[] = [];
  const trimmedSummary = summaryMarkdown?.trim();

  if (isNonEmptyString(trimmedSummary)) {
    sections.push(trimmedSummary);
  }

  if (isNonEmptyArray(actionItems)) {
    sections.push(
      `## Action items\n\n${actionItems.map(formatActionItem).join('\n')}`,
    );
  }

  return sections.join('\n\n');
};
