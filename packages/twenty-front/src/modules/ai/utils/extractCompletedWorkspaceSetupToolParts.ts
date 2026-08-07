import { isCompleteWorkspaceSetupToolPart } from '@/ai/utils/isCompleteWorkspaceSetupToolPart';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

export const extractCompletedWorkspaceSetupToolParts = (
  messageParts: ExtendedUIMessagePart[],
): { toolCallId: string }[] =>
  messageParts
    .filter(isCompleteWorkspaceSetupToolPart)
    .filter(
      (part) => (part.output as { success?: boolean } | undefined)?.success,
    )
    .map((part) => ({ toolCallId: part.toolCallId }));
