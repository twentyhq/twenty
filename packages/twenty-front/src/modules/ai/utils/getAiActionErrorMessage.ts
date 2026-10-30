import { t } from '@lingui/core/macro';
import { type SetuAiErrorCode } from 'twenty-shared/ai';

// Actionable copy for each stable code. None of it names records or
// mailboxes, matching what the server is willing to disclose.
export const getAiActionErrorMessage = (
  errorCode: SetuAiErrorCode | null | undefined,
): string => {
  switch (errorCode) {
    case 'INVALID_INPUT':
      return t`Some details are not valid. Check the fields and try again.`;
    case 'STALE_VERSION':
      return t`This action changed since you opened it. The latest version is shown; your edits are kept.`;
    case 'NOT_REVIEWABLE':
      return t`This action can no longer be changed.`;
    case 'ACTION_ALREADY_STARTED':
      return t`This action has already started, so it can no longer be stopped or edited.`;
    case 'APPROVAL_EXPIRED':
      return t`This review expired. Ask the assistant for a fresh draft.`;
    case 'SOURCE_CHANGED':
      return t`The record changed after this was prepared, so nothing was applied. Ask for a fresh proposal.`;
    case 'ACCOUNT_UNAVAILABLE':
      return t`The email account for this action is no longer available.`;
    case 'BUDGET_EXHAUSTED':
      return t`The AI budget for this work is used up.`;
    case 'UNSUPPORTED_ACTION':
      return t`This kind of change is not supported in chat.`;
    case 'NOT_AVAILABLE':
      return t`This action is not available.`;
    case 'MODEL_UNAVAILABLE':
      return t`No supported AI model is available.`;
    case 'TIMED_OUT':
      return t`This took too long and was stopped.`;
    case 'RESEARCH_FAILED':
      return t`This could not be completed.`;
    default:
      return t`Something went wrong. Try again.`;
  }
};
