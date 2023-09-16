import { RuleTester } from "@typescript-eslint/rule-tester";

import effectComponentsRule from "../rules/effect-components";
import matchingStateVariableRule from "../rules/matching-state-variable";
import noHardcodedColorsRule from "../rules/no-hardcoded-colors";
import styledComponentsRule from "../rules/styled-components-prefixed-with-styled";
import sortCssPropertiesAlphabeticallyRule from "../rules/sort-css-properties-alphabetically";

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

ruleTester.run("effect-components", effectComponentsRule, {
  valid: [
    {
      code: `const TestComponentEffect = () => <></>;`,
    },
    {
      code: `const TestComponent = () => <div></div>;`,
    },
    {
      code: `export const useUpdateEffect = () => null;`,
    },
    {
      code: `export const useUpdateEffect = () => <></>;`,
    },
    {
      code: `const TestComponent = () => <><div></div></>;`,
    },
    {
      code: `const TestComponentEffect = () => null;`,
    },
    {
      code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);

        return null; 
      }`,
    },
    {
      code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);
        
        return <></>; 
      }`,
    },
    {
      code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);
        
        return <></>; 
      }`,
    },
    {
      code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);
        
        return null; 
      }`,
    },
  ],
  invalid: [
    {
      code: "const TestComponent = () => <></>;",
      output: "const TestComponentEffect = () => <></>;",
      errors: [
        {
          messageId: "effectSuffix",
        },
      ],
    },
    {
      code: "const TestComponentEffect = () => <><div></div></>;",
      output: "const TestComponent = () => <><div></div></>;",
      errors: [
        {
          messageId: "noEffectSuffix",
        },
      ],
    },
  ],
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

ruleTester.run("no-hardcoded-colors", noHardcodedColorsRule, {
  valid: [
    {
      code: "const color = theme.background.secondary;",
    },
    {
      code: 'const color = "#000000";',
    },
  ],
  invalid: [
    {
      code: 'const color = "rgb(154,205,50)";',
      errors: [
        {
          messageId: "hardcodedColor",
        },
      ],
    },
    {
      code: 'const color = "#ADFF2F";',
      errors: [
        {
          messageId: "hardcodedColor",
        },
      ],
    },
  ],
});

ruleTester.run("styled-components-prefixed-with-styled", styledComponentsRule, {
  valid: [
    {
      code: `const StyledComponent = styled.div\`\`;`,
    },
    {
      code: `const StyledButton = styled.button\`\`;`,
    },
  ],
  invalid: [
    {
      code: "const Component = styled.div``;",
      errors: [
        {
          messageId: "styledPrefix",
        },
      ],
      output: "const StyledComponent = styled.div``;",
    },
    {
      code: "const Button = styled.button``;",
      errors: [
        {
          messageId: "styledPrefix",
        },
      ],
      output: "const StyledButton = styled.button``;",
    },
  ],
});

ruleTester.run(
  "sort-css-properties-alphabetically",
  sortCssPropertiesAlphabeticallyRule,
  {
    valid: [
      {
        code: `const StyledButton = styled.button\`
        border: none;
        color: #000;
      \`;`,
      },
      {
        code: `const StyledComponent = styled.div\`
        background: #fff;
        color: #000;
      \`;`,
      },
    ],
    invalid: [
      {
        code: "const Component = styled.div`color: #000; background: #fff;`;",
        errors: [
          {
            messageId: "sort-css-properties-alphabetically",
          },
        ],
      },
      {
        code: "const Button = styled.button`color: #000; border: none;`;",
        errors: [
          {
            messageId: "sort-css-properties-alphabetically",
          },
        ],
      },
    ],
  }
);
