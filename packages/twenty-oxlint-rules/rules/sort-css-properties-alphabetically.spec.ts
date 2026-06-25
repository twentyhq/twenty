import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './sort-css-properties-alphabetically';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'const style = css`color: red;`;',
    },
    {
      code: 'const style = css`background-color: $bgColor;color: red;`;',
    },
    {
      code: 'const StyledComponent = styled.div`color: red;`;',
    },
    {
      code: 'const StyledComponent = styled.div`background-color: $bgColor;color: red;`;',
    },
  ],
  invalid: [
    {
      code: 'const style = css`color: #FF0000;background-color: $bgColor`;',
      output: 'const style = css`background-color: $bgColorcolor: #FF0000;`;',
      errors: [
        {
          messageId: 'sortCssPropertiesAlphabetically',
        },
      ],
    },
    {
      code: 'const StyledComponent = styled.div`color: #FF0000;background-color: $bgColor`;',
      output:
        'const StyledComponent = styled.div`background-color: $bgColorcolor: #FF0000;`;',
      errors: [
        {
          messageId: 'sortCssPropertiesAlphabetically',
        },
      ],
    },
  ],
});
