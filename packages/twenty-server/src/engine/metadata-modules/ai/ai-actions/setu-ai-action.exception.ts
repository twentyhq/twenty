import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type SetuAiErrorCode } from 'twenty-shared/ai';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

// Messages never name records or mailboxes, so an error cannot disclose
// what the caller is not allowed to see.
const getSetuAiActionUserFriendlyMessage = (
  code: SetuAiErrorCode,
): MessageDescriptor => {
  switch (code) {
    case 'INVALID_INPUT':
      return msg`This action has invalid details.`;
    case 'STALE_VERSION':
      return msg`This action changed since you opened it. Review the latest version.`;
    case 'NOT_REVIEWABLE':
      return msg`This action can no longer be changed.`;
    case 'ACTION_ALREADY_STARTED':
      return msg`This action has already started and can no longer be stopped.`;
    case 'APPROVAL_EXPIRED':
      return msg`This approval expired. Ask for a fresh draft.`;
    case 'SOURCE_CHANGED':
      return msg`The record changed since this was prepared. Ask for a fresh draft.`;
    case 'ACCOUNT_UNAVAILABLE':
      return msg`The email account for this action is unavailable.`;
    case 'BUDGET_EXHAUSTED':
      return msg`The AI budget for this work is used up.`;
    case 'UNSUPPORTED_ACTION':
      return msg`This action is not supported in chat.`;
    case 'NOT_AVAILABLE':
      return msg`This action is not available.`;
    case 'MODEL_UNAVAILABLE':
      return msg`No supported AI model is available for this work.`;
    case 'TIMED_OUT':
      return msg`This work took too long and was stopped.`;
    case 'RESEARCH_FAILED':
      return msg`The research could not be completed.`;
    default:
      return assertUnreachable(code);
  }
};

export class SetuAiActionException extends CustomException<SetuAiErrorCode> {
  constructor(message: string, code: SetuAiErrorCode) {
    super(message, code, {
      userFriendlyMessage: getSetuAiActionUserFriendlyMessage(code),
    });
  }
}
