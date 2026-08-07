import { isCompleteWorkspaceSetupToolPart } from '@/ai/utils/isCompleteWorkspaceSetupToolPart';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

export const isHiddenCompleteWorkspaceSetupToolPart = (
  part: ExtendedUIMessagePart,
): boolean =>
  isCompleteWorkspaceSetupToolPart(part) &&
  part.state !== 'output-error' &&
  part.state !== 'output-denied';
