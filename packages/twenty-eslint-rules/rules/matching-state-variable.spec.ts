import { TSESLint } from '@typescript-eslint/utils';

import { rule, RULE_NAME } from './matching-state-variable';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'const variable = useRecoilValue(variableState);',
    },
    {
      code: 'const variable = useRecoilScopedValue(variableScopedState);',
    },
    {
      code: 'const [variable, setVariable] = useRecoilState(variableScopedState);',
    },
    {
      code: 'const [variable, setVariable] = useRecoilScopedState(variableScopedState);',
    },
    {
      code: 'const [variable, setVariable] = useRecoilFamilyState(variableScopedState);',
    },
    {
      code: 'const [variable, setVariable] = useRecoilScopedFamilyState(variableScopedState);',
    },
  ],
  invalid: [
    {
      code: 'const myValue = useRecoilValue(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
      ],
      output: 'const variable = useRecoilValue(variableState);',
    },
    {
      code: 'const myValue = useRecoilScopedValue(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
      ],
      output: 'const variable = useRecoilScopedValue(variableState);',
    },

    {
      code: 'const [myValue, setMyValue] = useRecoilState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
        {
          messageId: 'invalidSetterName',
        },
      ],
      output: 'const [variable, setVariable] = useRecoilState(variableState);',
    },
    {
      code: 'const [myValue] = useRecoilState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
      ],
      output: 'const [variable] = useRecoilState(variableState);',
    },
    {
      code: 'const [, setMyValue] = useRecoilState(variableState);',
      errors: [
        {
          messageId: 'invalidSetterName',
        },
      ],
      output: 'const [, setVariable] = useRecoilState(variableState);',
    },

    {
      code: 'const [myValue, setMyValue] = useRecoilScopedState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
        {
          messageId: 'invalidSetterName',
        },
      ],
      output:
        'const [variable, setVariable] = useRecoilScopedState(variableState);',
    },
    {
      code: 'const [myValue] = useRecoilScopedState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
      ],
      output: 'const [variable] = useRecoilScopedState(variableState);',
    },
    {
      code: 'const [, setMyValue] = useRecoilScopedState(variableState);',
      errors: [
        {
          messageId: 'invalidSetterName',
        },
      ],
      output: 'const [, setVariable] = useRecoilScopedState(variableState);',
    },

    {
      code: 'const [myValue, setMyValue] = useRecoilFamilyState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
        {
          messageId: 'invalidSetterName',
        },
      ],
      output:
        'const [variable, setVariable] = useRecoilFamilyState(variableState);',
    },
    {
      code: 'const [myValue] = useRecoilFamilyState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
      ],
      output: 'const [variable] = useRecoilFamilyState(variableState);',
    },
    {
      code: 'const [, setMyValue] = useRecoilFamilyState(variableState);',
      errors: [
        {
          messageId: 'invalidSetterName',
        },
      ],
      output: 'const [, setVariable] = useRecoilFamilyState(variableState);',
    },

    {
      code: 'const [myValue, setMyValue] = useRecoilScopedFamilyState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
        {
          messageId: 'invalidSetterName',
        },
      ],
      output:
        'const [variable, setVariable] = useRecoilScopedFamilyState(variableState);',
    },
    {
      code: 'const [myValue] = useRecoilScopedFamilyState(variableState);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
      ],
      output: 'const [variable] = useRecoilScopedFamilyState(variableState);',
    },
    {
      code: 'const [, setMyValue] = useRecoilScopedFamilyState(variableState);',
      errors: [
        {
          messageId: 'invalidSetterName',
        },
      ],
      output:
        'const [, setVariable] = useRecoilScopedFamilyState(variableState);',
    },
  ],
});
