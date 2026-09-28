import { msg } from '@lingui/core/macro';

import { type ValidationRuleSyntaxDefinition } from '@/validation-rules/types/ValidationRuleSyntaxDefinition';

export const VALIDATION_RULE_FUNCTIONS: ValidationRuleSyntaxDefinition[] = [
  {
    name: 'isDefined',
    signature: 'isDefined(value)',
    description: msg`True when the value is set, even to an empty text.`,
  },
  {
    name: 'isEmpty',
    signature: 'isEmpty(value)',
    description: msg`True when the value is not set, an empty text, an empty list, or a composite field with every part empty.`,
  },
  {
    name: 'isNonEmptyString',
    signature: 'isNonEmptyString(value)',
    description: msg`True when the value is a text with at least one character.`,
  },
  {
    name: 'includes',
    signature: 'includes(listOrText, value)',
    description: msg`True when a multi-select or array field contains the value, or when a text contains the given text. Letter case matters.`,
  },
  {
    name: 'arrayLength',
    signature: 'arrayLength(list)',
    description: msg`The number of items in the list, or 0 when it is not a list.`,
  },
];
