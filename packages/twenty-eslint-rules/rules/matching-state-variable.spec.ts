import { TSESLint } from '@typescript-eslint/utils';
import { rule, RULE_NAME } from './matching-state-variable';

const ruleTester = new TSESLint.RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // useAtomState / useAtomStateValue (existing)
    {
      code: 'const variable = useAtomStateValue(variableState);',
    },
    {
      code: 'const [variable, setVariable] = useAtomState(variableState);',
    },

    // useAtomComponentStateValue / useAtomComponentState
    {
      code: 'const variable = useAtomComponentStateValue(variableComponentState);',
    },
    {
      code: 'const [variable, setVariable] = useAtomComponentState(variableComponentState);',
    },

    // useAtomFamilyStateValue
    {
      code: 'const variable = useAtomFamilyStateValue(variableFamilyState, key);',
    },

    // useAtomComponentFamilyStateValue / useAtomComponentFamilyState
    {
      code: 'const variable = useAtomComponentFamilyStateValue(variableComponentFamilyState, key);',
    },
    {
      code: 'const [variable, setVariable] = useAtomComponentFamilyState(variableComponentFamilyState, key);',
    },

    // Setter hooks
    {
      code: 'const setVariable = useSetAtomState(variableState);',
    },
    {
      code: 'const setVariable = useSetAtomComponentState(variableComponentState);',
    },
    {
      code: 'const setVariable = useSetAtomFamilyState(variableFamilyState, key);',
    },
    {
      code: 'const setVariable = useSetAtomComponentFamilyState(variableComponentFamilyState, key);',
    },
  ],
  invalid: [
    // useAtomStateValue - wrong variable name
    {
      code: 'const myValue = useAtomStateValue(variableState);',
      errors: [{ messageId: 'invalidVariableName' }],
    },

    // useAtomState - wrong variable and setter
    {
      code: 'const [myValue, setMyValue] = useAtomState(variableState);',
      errors: [
        { messageId: 'invalidVariableName' },
        { messageId: 'invalidSetterName' },
      ],
    },
    {
      code: 'const [myValue] = useAtomState(variableState);',
      errors: [{ messageId: 'invalidVariableName' }],
    },
    {
      code: 'const [, setMyValue] = useAtomState(variableState);',
      errors: [{ messageId: 'invalidSetterName' }],
    },

    // useAtomComponentStateValue - wrong variable name
    {
      code: 'const myValue = useAtomComponentStateValue(variableComponentState);',
      errors: [{ messageId: 'invalidVariableName' }],
    },

    // useAtomComponentState - wrong variable and setter
    {
      code: 'const [myValue, setMyValue] = useAtomComponentState(variableComponentState);',
      errors: [
        { messageId: 'invalidVariableName' },
        { messageId: 'invalidSetterName' },
      ],
    },

    // useAtomFamilyStateValue - wrong variable name
    {
      code: 'const myValue = useAtomFamilyStateValue(variableFamilyState, key);',
      errors: [{ messageId: 'invalidVariableName' }],
    },

    // useAtomComponentFamilyStateValue - wrong variable name
    {
      code: 'const myValue = useAtomComponentFamilyStateValue(variableComponentFamilyState, key);',
      errors: [{ messageId: 'invalidVariableName' }],
    },

    // useAtomComponentFamilyState - wrong variable and setter
    {
      code: 'const [myValue, setMyValue] = useAtomComponentFamilyState(variableComponentFamilyState, key);',
      errors: [
        { messageId: 'invalidVariableName' },
        { messageId: 'invalidSetterName' },
      ],
    },

    // useSetAtomState - wrong setter name
    {
      code: 'const myValue = useSetAtomState(variableState);',
      errors: [{ messageId: 'invalidSetterName' }],
    },

    // useSetAtomComponentState - wrong setter name
    {
      code: 'const myValue = useSetAtomComponentState(variableComponentState);',
      errors: [{ messageId: 'invalidSetterName' }],
    },

    // useSetAtomFamilyState - wrong setter name
    {
      code: 'const myValue = useSetAtomFamilyState(variableFamilyState, key);',
      errors: [{ messageId: 'invalidSetterName' }],
    },

    // useSetAtomComponentFamilyState - wrong setter name
    {
      code: 'const myValue = useSetAtomComponentFamilyState(variableComponentFamilyState, key);',
      errors: [{ messageId: 'invalidSetterName' }],
    },
  ],
});
