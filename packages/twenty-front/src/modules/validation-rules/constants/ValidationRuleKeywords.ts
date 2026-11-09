import { msg } from '@lingui/core/macro';

import { type ValidationRuleSyntaxDefinition } from '@/validation-rules/types/ValidationRuleSyntaxDefinition';
import { VALIDATION_RULE_PREVIOUS_VARIABLE_NAME } from 'twenty-shared/constants';
import { doNotTranslate } from 'twenty-shared/i18n';

export const VALIDATION_RULE_KEYWORDS: ValidationRuleSyntaxDefinition[] = [
  {
    name: 'and',
    signature: doNotTranslate('a and b'),
    description: msg`True when both sides are true.`,
  },
  {
    name: 'or',
    signature: doNotTranslate('a or b'),
    description: msg`True when at least one side is true.`,
  },
  {
    name: 'not',
    signature: doNotTranslate('not a'),
    description: msg`Turns true into false and false into true.`,
  },
  {
    name: 'in',
    signature: doNotTranslate('value in [a, b]'),
    description: msg`True when the value is one of the listed values.`,
  },
  {
    name: 'now',
    signature: 'now',
    description: msg`The date and time of the write being checked.`,
  },
  {
    name: VALIDATION_RULE_PREVIOUS_VARIABLE_NAME,
    signature: doNotTranslate('previous.field'),
    description: msg`The value a field had before the update. Empty when the record is created.`,
    insertText: `${VALIDATION_RULE_PREVIOUS_VARIABLE_NAME}.`,
  },
  {
    name: 'true',
    signature: 'true',
    description: msg`The boolean value true.`,
  },
  {
    name: 'false',
    signature: 'false',
    description: msg`The boolean value false.`,
  },
];
