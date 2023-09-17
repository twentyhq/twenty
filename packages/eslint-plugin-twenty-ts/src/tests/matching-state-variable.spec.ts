import { RuleTester } from "@typescript-eslint/rule-tester";
import matchingStateVariableRule from "../rules/matching-state-variable";

const ruleTester = new RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run('matching-state-variable', matchingStateVariableRule, {
  valid: [
    {
      code: 'const variable = useRecoilValue(variableState);',
    },
    {
      code: 'const [variable, setVariable] = useRecoilState(variableState);',
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
  ],
});
