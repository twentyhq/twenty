import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './styled-components-prefixed-with-styled';

const ruleTester = new RuleTester();

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
