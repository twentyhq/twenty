import { VALIDATION_RULE_EXPRESSION_SYNTAX_DESCRIPTION } from 'twenty-shared/constants';

export const VALIDATION_RULE_AI_CHAT_FORM_FIELDS = [
  { name: 'name', description: 'Short rule name.' },
  {
    name: 'expression',
    description: `${VALIDATION_RULE_EXPRESSION_SYNTAX_DESCRIPTION} Check it with validate_validation_rule_expression before filling.`,
  },
  {
    name: 'message',
    description: 'Message shown when the condition is false.',
  },
  {
    name: 'errorFieldName',
    description:
      'Name of the field the message is shown on. Leave it empty to show the message on the whole record.',
  },
];
