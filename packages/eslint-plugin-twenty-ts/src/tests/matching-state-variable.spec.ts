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

ruleTester.run("matching-state-variable", matchingStateVariableRule, {
  valid: [
    {
      code: "const someAtom = useRecoilValue(someAtom);",
    },
    {
      code: "const [someAtom, setSomeAtom] = useRecoilState(someAtom);",
    },
  ],
  invalid: [
    {
      code: "const newValue = useRecoilValue(someAtom);",
      errors: [
        {
          messageId: "invalidVariableName",
        },
      ],
      output: "const some = useRecoilValue(someAtom);",
    },
    {
      code: "const [newValue, setNewValue] = useRecoilState(someAtom);",
      errors: [
        {
          messageId: "invalidVariableName",
        },
        {
          messageId: "invalidSetterName",
        },
      ],
      output: "const some = useRecoilValue(someAtom);",
    },
  ],
});
