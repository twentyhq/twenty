import { TSESLint } from '@typescript-eslint/utils';
import { rule, RULE_NAME } from './matching-state-variable';

const ruleTester = new TSESLint.RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'const variable = useAtomStateValue(variableState);',
    },
    {
      code: 'const [variable, setVariable] = useAtomState(variableState);',
    },
    // Component/Family hooks are not checked by this rule
    {
      code: 'const anything = useAtomComponentStateValue(variableComponentState);',
    },
    {
      code: 'const anything = useAtomFamilyStateValue(variableFamilyState);',
    },
    {
      code: 'const [anything, setAnything] = useAtomComponentFamilyState(variableComponentFamilyState);',
    },
  ],
  invalid: [
    {
      code: 'const myValue = useAtomStateValue(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
      ],
    },
    {
      code: 'const [myValue, setMyValue] = useAtomState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
        {
          messageId: 'invalidSetterName',
        },
      ],
    },
    {
      code: 'const [myValue] = useAtomState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
      ],
    },
    {
      code: 'const [, setMyValue] = useAtomState(variableState);',
      errors: [
        {
          messageId: 'invalidSetterName',
        },
      ],
    },
  ],
});
