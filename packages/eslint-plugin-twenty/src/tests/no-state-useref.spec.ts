import { RuleTester } from "@typescript-eslint/rule-tester";

import noStateUseRefRule from "../rules/no-state-useref";

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

ruleTester.run("no-state-useref", noStateUseRefRule, {
  valid: [
    {
      code: "const ref = useRef<HTMLDivElement>(null);",
    },
    {
      code: "const ref = useRef<HTMLInputElement>(null);",
    },
  ],
  invalid: [
    {
      code: "const ref = useRef(null);",
      errors: [
        {
          messageId: "noStateUseRef",
        },
      ],
    },
    {
      code: "const isValid = useRef<Boolean>(null);",
      errors: [
        {
          messageId: "noStateUseRef",
        },
      ],
    },
  ],
});
