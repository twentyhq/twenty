import { randomUUID } from 'node:crypto';

import { printTypescriptValue } from '@/app/pull/print-typescript-value';

export const getValidationRuleBaseFile = ({
  name,
  objectUniversalIdentifier,
  universalIdentifier = randomUUID(),
}: {
  name: string;
  objectUniversalIdentifier: string;
  universalIdentifier?: string;
}) => `import { defineValidationRule, ruleExpression } from 'twenty-sdk/define';

const { field, isNonEmptyString } = ruleExpression;

export default defineValidationRule({
  universalIdentifier: ${printTypescriptValue({ value: universalIdentifier })},
  objectUniversalIdentifier: ${printTypescriptValue({ value: objectUniversalIdentifier })},
  name: ${printTypescriptValue({ value: name })},
  expression: isNonEmptyString(field('name')),
  message: 'Add the message shown when a record breaks this rule',
});
`;
