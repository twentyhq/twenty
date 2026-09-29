import { isString } from '@sniptt/guards';
import { type InputAskForm } from 'twenty-shared/ai';
import { isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

// The form is stored as JSON, so what a card renders is checked here rather
// than trusted.
export const parseInputAskForm = (form: unknown): InputAskForm | null => {
  if (!isPlainObject(form)) {
    return null;
  }

  switch (form.kind) {
    case 'questions':
      return Array.isArray(form.questions) && isNonEmptyArray(form.questions)
        ? (form as InputAskForm)
        : null;
    case 'formFields':
      return Array.isArray(form.fields) ? (form as InputAskForm) : null;
    case 'emailApproval':
      return isPlainObject(form.email) &&
        isPlainObject(form.email.recipients) &&
        isString(form.email.subject) &&
        isString(form.email.body)
        ? (form as InputAskForm)
        : null;
    default:
      return null;
  }
};
