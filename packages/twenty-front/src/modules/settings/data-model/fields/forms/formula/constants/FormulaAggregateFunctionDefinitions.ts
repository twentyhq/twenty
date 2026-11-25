import { msg } from '@lingui/core/macro';
import { doNotTranslate } from 'twenty-shared/i18n';

import { type ValidationRuleSyntaxDefinition } from '@/validation-rules/types/ValidationRuleSyntaxDefinition';

export const FORMULA_AGGREGATE_FUNCTION_DEFINITIONS: ValidationRuleSyntaxDefinition[] =
  [
    {
      name: 'count',
      signature: doNotTranslate('count(relation, condition?)'),
      description: msg`The number of related records, or of those matching the condition. For example count(tasks, tasks.status == "TODO").`,
    },
    {
      name: 'sum',
      signature: doNotTranslate('sum(relation.field, condition?)'),
      description: msg`The total of a number field over the related records, or over those matching the condition.`,
    },
    {
      name: 'avg',
      signature: doNotTranslate('avg(relation.field, condition?)'),
      description: msg`The average of a number field over the related records, or over those matching the condition.`,
    },
    {
      name: 'min',
      signature: doNotTranslate('min(relation.field, condition?)'),
      description: msg`The smallest number or earliest date among the related records. With plain values, such as min(a, b), the smallest of them.`,
    },
    {
      name: 'max',
      signature: doNotTranslate('max(relation.field, condition?)'),
      description: msg`The largest number or latest date among the related records. With plain values, such as max(a, b), the largest of them.`,
    },
  ];
