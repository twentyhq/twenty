import { isSucceededCompleteWorkspaceSetupToolPart } from '@/ai/utils/isSucceededCompleteWorkspaceSetupToolPart';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

export const extractCompletedWorkspaceSetupToolParts = (
  messageParts: ExtendedUIMessagePart[],
): { toolCallId: string }[] =>
  messageParts
    .filter(isSucceededCompleteWorkspaceSetupToolPart)
    .map((part) => ({ toolCallId: part.toolCallId }));
