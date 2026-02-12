import { TSESLint } from '@typescript-eslint/utils';

import { rule, RULE_NAME } from './styled-components-prefixed-with-styled';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'const StyledButton = styled.button``;',
    },
    {
      code: 'const StyledComponent = styled.div``;',
    },
  ],
  invalid: [
    {
      code: 'const Button = styled.button``;',
      errors: [
        {
          messageId: 'noStyledPrefix',
        },
      ],
    },
    {
      code: 'const Component = styled.div``;',
      errors: [
        {
          messageId: 'noStyledPrefix',
        },
      ],
    },
  ],
});
