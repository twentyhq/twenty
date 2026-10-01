import { msg } from '@lingui/core/macro';

import { type ValidationRuleSyntaxDefinition } from '@/validation-rules/types/ValidationRuleSyntaxDefinition';

export const VALIDATION_RULE_KEYWORDS: ValidationRuleSyntaxDefinition[] = [
  {
    name: 'and',
    signature: 'a and b',
    description: msg`True when both sides are true.`,
  },
  {
    name: 'or',
    signature: 'a or b',
    description: msg`True when at least one side is true.`,
  },
  {
    name: 'not',
    signature: 'not a',
    description: msg`Turns true into false and false into true.`,
  },
  {
    name: 'in',
    signature: 'value in [a, b]',
    description: msg`True when the value is one of the listed values.`,
  },
  {
    name: 'now',
    signature: 'now',
    description: msg`The date and time of the write being checked.`,
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
