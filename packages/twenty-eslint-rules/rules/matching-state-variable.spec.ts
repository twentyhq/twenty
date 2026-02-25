import { TSESLint } from '@typescript-eslint/utils';
import { rule, RULE_NAME } from './matching-state-variable';

const ruleTester = new TSESLint.RuleTester();

ruleTester.run(RULE_NAME, rule as any, {
  valid: [
    {
      code: 'const variable = useAtomStateValue(variableState);',
    },
    {
      code: 'const variable = useAtomComponentStateValue(variableState);',
    },
    {
      code: 'const [variable, setVariable] = useAtomState(variableState);',
    },
    {
      code: 'const [variable, setVariable] = useAtomComponentState(variableState);',
    },
    {
      code: 'const [variable, setVariable] = useAtomComponentFamilyState(variableState);',
    },
    {
      code: 'const variable = useAtomFamilyStateValue(variableState);',
    },
    {
      code: 'const variable = useAtomComponentFamilyStateValue(variableState);',
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
      output: 'const variable = useAtomStateValue(variableState);',
    },
    {
      code: 'const myValue = useAtomComponentStateValue(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
      ],
      output: 'const variable = useAtomComponentStateValue(variableState);',
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
      output: 'const [variable, setVariable] = useAtomState(variableState);',
    },
    {
      code: 'const [myValue] = useAtomState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
      ],
      output: 'const [variable] = useAtomState(variableState);',
    },
    {
      code: 'const [, setMyValue] = useAtomState(variableState);',
      errors: [
        {
          messageId: 'invalidSetterName',
        },
      ],
      output: 'const [, setVariable] = useAtomState(variableState);',
    },

    {
      code: 'const [myValue, setMyValue] = useAtomComponentState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
        {
          messageId: 'invalidSetterName',
        },
      ],
      output:
        'const [variable, setVariable] = useAtomComponentState(variableState);',
    },
    {
      code: 'const [myValue] = useAtomComponentState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
      ],
      output: 'const [variable] = useAtomComponentState(variableState);',
    },
    {
      code: 'const [, setMyValue] = useAtomComponentState(variableState);',
      errors: [
        {
          messageId: 'invalidSetterName',
        },
      ],
      output: 'const [, setVariable] = useAtomComponentState(variableState);',
    },

    {
      code: 'const [myValue, setMyValue] = useAtomComponentFamilyState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
        {
          messageId: 'invalidSetterName',
        },
      ],
      output:
        'const [variable, setVariable] = useAtomComponentFamilyState(variableState);',
    },
    {
      code: 'const [myValue] = useAtomComponentFamilyState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
      ],
      output: 'const [variable] = useAtomComponentFamilyState(variableState);',
    },
    {
      code: 'const [, setMyValue] = useAtomComponentFamilyState(variableState);',
      errors: [
        {
          messageId: 'invalidSetterName',
        },
      ],
      output:
        'const [, setVariable] = useAtomComponentFamilyState(variableState);',
    },
  ],
});
