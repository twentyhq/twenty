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
      code: 'const myState = useRecoilValue(someAtom);',
    },
    {
      code: 'const [myState, setMyState] = useRecoilState(someAtom);',
    },
  ],
  invalid: [
    {
      code: 'const myValue = useRecoilValue(someAtom);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
      ],
      output: 'const some = useRecoilValue(someAtom);',
    },
    {
      code: 'const [myValue, setMyValue] = useRecoilState(someAtom);',
      errors: [
        {
          messageId: 'invalidVariableName',
        },
        {
          messageId: 'invalidSetterName',
        },
      ],
      output: 'const [some, setSome] = useRecoilState(someAtom);',
    },
  ],
});
