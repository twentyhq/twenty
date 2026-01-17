import { TSESLint } from '@typescript-eslint/utils';

import { rule, RULE_NAME } from './no-navigate-prefer-link';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'if(someVar) { navigate("/"); }',
    },
    {
      code: '<Link to="/"><Button>Click me</Button></Link>',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: '<Button onClick={() =>{ navigate("/"); doSomething(); }} />',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  ],
  invalid: [
    {
      code: '<Button onClick={() => navigate("/")} />',
      errors: [
        {
          messageId: 'preferLink',
        },
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: '<Button onClick={() => { navigate("/");} } />',
      errors: [
        {
          messageId: 'preferLink',
        },
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  ],
});
