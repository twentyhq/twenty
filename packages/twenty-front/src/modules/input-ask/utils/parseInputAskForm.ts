import { isString } from '@sniptt/guards';
import { isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

import { type AgentChatPendingAsk } from '@/ai/types/AgentChatPendingAsk';

type ChatInputAskForm = AgentChatPendingAsk['form'];

// The form is stored as JSON, so what a card renders is checked here rather
// than trusted.
export const parseInputAskForm = (form: unknown): ChatInputAskForm | null => {
  if (!isPlainObject(form)) {
    return null;
  }

  switch (form.kind) {
    case 'questions':
      return Array.isArray(form.questions) && isNonEmptyArray(form.questions)
        ? (form as ChatInputAskForm)
        : null;
    case 'emailApproval':
      return isPlainObject(form.email) &&
        isPlainObject(form.email.recipients) &&
        isString(form.email.subject) &&
        isString(form.email.body)
        ? (form as ChatInputAskForm)
        : null;
    default:
      return null;
  }
};
