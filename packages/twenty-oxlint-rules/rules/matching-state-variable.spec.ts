import { RuleTester } from 'oxlint/plugins-dev';
import { rule, RULE_NAME } from './matching-state-variable';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'const variable = useAtomStateValue(variableState);',
    },
    {
      code: 'const [variable, setVariable] = useAtomState(variableState);',
    },
    {
      code: 'const variable = useAtomComponentStateValue(variableComponentState);',
    },
    {
      code: 'const [variable, setVariable] = useAtomComponentState(variableComponentState);',
    },
    {
      code: 'const variable = useAtomFamilyStateValue(variableFamilyState, key);',
    },
    {
      code: 'const variable = useAtomComponentFamilyStateValue(variableComponentFamilyState, key);',
    },
    {
      code: 'const [variable, setVariable] = useAtomComponentFamilyState(variableComponentFamilyState, key);',
    },
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
    {
      code: 'const myValue = useAtomStateValue(variableState);',
      output: 'const variable = useAtomStateValue(variableState);',
      errors: [{ messageId: 'invalidVariableName' }],
    },
    {
      code: 'const [myValue, setMyValue] = useAtomState(variableState);',
      output: 'const [variable, setVariable] = useAtomState(variableState);',
      errors: [
        { messageId: 'invalidVariableName' },
        { messageId: 'invalidSetterName' },
      ],
    },
    {
      code: 'const [myValue] = useAtomState(variableState);',
      output: 'const [variable] = useAtomState(variableState);',
      errors: [{ messageId: 'invalidVariableName' }],
    },
    {
      code: 'const [, setMyValue] = useAtomState(variableState);',
      output: 'const [, setVariable] = useAtomState(variableState);',
      errors: [{ messageId: 'invalidSetterName' }],
    },
    {
      code: 'const myValue = useAtomComponentStateValue(variableComponentState);',
      output: 'const variable = useAtomComponentStateValue(variableComponentState);',
      errors: [{ messageId: 'invalidVariableName' }],
    },
    {
      code: 'const [myValue, setMyValue] = useAtomComponentState(variableComponentState);',
      output: 'const [variable, setVariable] = useAtomComponentState(variableComponentState);',
      errors: [
        { messageId: 'invalidVariableName' },
        { messageId: 'invalidSetterName' },
      ],
    },
    {
      code: 'const myValue = useAtomFamilyStateValue(variableFamilyState, key);',
      output: 'const variable = useAtomFamilyStateValue(variableFamilyState, key);',
      errors: [{ messageId: 'invalidVariableName' }],
    },
    {
      code: 'const myValue = useAtomComponentFamilyStateValue(variableComponentFamilyState, key);',
      output: 'const variable = useAtomComponentFamilyStateValue(variableComponentFamilyState, key);',
      errors: [{ messageId: 'invalidVariableName' }],
    },
    {
      code: 'const [myValue, setMyValue] = useAtomComponentFamilyState(variableComponentFamilyState, key);',
      output: 'const [variable, setVariable] = useAtomComponentFamilyState(variableComponentFamilyState, key);',
      errors: [
        { messageId: 'invalidVariableName' },
        { messageId: 'invalidSetterName' },
      ],
    },
    {
      code: 'const myValue = useSetAtomState(variableState);',
      output: 'const setVariable = useSetAtomState(variableState);',
      errors: [{ messageId: 'invalidSetterName' }],
    },
    {
      code: 'const myValue = useSetAtomComponentState(variableComponentState);',
      output: 'const setVariable = useSetAtomComponentState(variableComponentState);',
      errors: [{ messageId: 'invalidSetterName' }],
    },
    {
      code: 'const myValue = useSetAtomFamilyState(variableFamilyState, key);',
      output: 'const setVariable = useSetAtomFamilyState(variableFamilyState, key);',
      errors: [{ messageId: 'invalidSetterName' }],
    },
    {
      code: 'const myValue = useSetAtomComponentFamilyState(variableComponentFamilyState, key);',
      output: 'const setVariable = useSetAtomComponentFamilyState(variableComponentFamilyState, key);',
      errors: [{ messageId: 'invalidSetterName' }],
    },
  ],
});
