import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './no-navigate-prefer-link';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'if(someVar) { navigate("/"); }',
    },
    {
      code: '<Link to="/"><Button>Click me</Button></Link>',
      filename: 'test.tsx',
    },
    {
      code: '<Button onClick={() =>{ navigate("/"); doSomething(); }} />',
      filename: 'test.tsx',
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
      filename: 'test.tsx',
    },
    {
      code: '<Button onClick={() => { navigate("/");} } />',
      errors: [
        {
          messageId: 'preferLink',
        },
      ],
      filename: 'test.tsx',
    },
  ],
});
