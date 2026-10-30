import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { RuleTester } from 'oxlint/plugins-dev';
import { isNonEmptyString } from 'twenty-shared/utils';
import { describe, expect, it } from 'vitest';

import { TWENTY_UI_OVERRIDE_EXEMPTIONS } from './no-twenty-ui-override.exemptions';
import { rule, RULE_NAME } from './no-twenty-ui-override';

const REPOSITORY_ROOT = join(import.meta.dirname, '../../..');

const FRONT_FILENAME =
  '/repository/packages/twenty-front/src/modules/example/components/Example.tsx';

const [EXEMPTED_FILE] = TWENTY_UI_OVERRIDE_EXEMPTIONS;

const STYLED_TWENTY_UI_BUTTON_CODE = `
  import { styled } from '@linaria/react';
  import { Button } from 'twenty-ui/primitives/input';

  const StyledButton = styled(Button)\`
    align-self: flex-end;
  \`;
`;

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import { styled } from '@linaria/react';
        import { Card } from '@/ui/layout/card/components/Card';

        const StyledCard = styled(Card)\`
          display: flex;
        \`;
      `,
      filename: FRONT_FILENAME,
    },
    {
      code: `
        import { styled } from '@linaria/react';
        import { IconPlus } from 'twenty-ui/icon';

        const StyledIconPlus = styled(IconPlus)\`
          flex-shrink: 0;
        \`;
      `,
      filename: FRONT_FILENAME,
    },
    {
      code: `
        import { Card } from 'twenty-ui/primitives/surfaces';

        const Example = ({ className }) => (
          <div className={className} style={{ display: 'flex' }}>
            <Card.Root backgroundColor="secondary" />
          </div>
        );
      `,
      filename: FRONT_FILENAME,
    },
    {
      code: `
        import { css } from '@linaria/core';
        import { styled } from '@linaria/react';

        const StyledContainer = styled.div\`
          --widget-height: 120px;
          color: var(--tw-button-color);
        \`;

        const exampleClassName = css\`
          background-color: var(--card-background-color, transparent);
        \`;
      `,
      filename: FRONT_FILENAME,
    },
    {
      code: `
        const Example = () => <div style={{ '--parallax-x': '4px' }} />;

        element.style.setProperty('--parallax-y', '8px');

        const { '--tw-button-color': buttonColor } = computedVariables;
      `,
      filename: FRONT_FILENAME,
    },
    {
      code: `
        import { styled } from '@linaria/react';

        const StyledContainer = styled.div\`
          /* --tw-button-size: 40px; [data-skeleton] */
          content: '[data-active]';
        \`;
      `,
      filename: FRONT_FILENAME,
    },
    {
      code: `
        import { styled } from '@linaria/react';

        const StyledRow = styled.div\`
          &[data-active='true'] {
            background-color: blue;
          }

          &:hover[data-active-tab] {
            color: red;
          }

          & [data-popup-open] {
            color: blue;
          }
        \`;
      `,
      filename: FRONT_FILENAME,
    },
    {
      code: `
        const widget = container.querySelector('[data-widget-id="widget"]');
        const isActive = element.getAttribute('data-active') === 'true';
      `,
      filename: FRONT_FILENAME,
    },
    {
      code: `
        import { css } from '@linaria/core';
        import { styled } from '@linaria/react';
        import { TabList } from '@/ui/layout/tab-list/components/TabList';

        const StyledTabList = styled(TabList)\`
          && {
            flex-shrink: 0;
          }
        \`;

        const StyledDatePickerContainer = styled.div\`
          & .react-datepicker-popper {
            transform: none !important;
          }
        \`;

        const printClassName = css\`
          @media print {
            height: auto !important;
          }
        \`;

        const isVisible = isOpen && isEnabled;
      `,
      filename: FRONT_FILENAME,
    },
    {
      code: STYLED_TWENTY_UI_BUTTON_CODE,
      filename: `/repository/${EXEMPTED_FILE.filePath}`,
    },
  ],
  invalid: [
    {
      code: STYLED_TWENTY_UI_BUTTON_CODE,
      filename: FRONT_FILENAME,
      errors: [
        {
          messageId: 'styledTwentyUiComponent',
          data: { componentName: 'Button' },
        },
      ],
    },
    {
      code: `
        import { styled } from '@linaria/react';
        import { Card as TwentyCard } from 'twenty-ui/primitives/surfaces';

        const StyledCardContent = styled(TwentyCard.Content)\`
          padding: 0;
        \`;
      `,
      filename: FRONT_FILENAME,
      errors: [
        {
          messageId: 'styledTwentyUiComponent',
          data: { componentName: 'TwentyCard.Content' },
        },
      ],
    },
    {
      code: `
        import { Dialog } from 'twenty-ui/components/feedback';
        import { Tag } from 'twenty-ui/primitives/data-display';

        const Example = () => (
          <Dialog.Popup className="popup" backdropClassName="backdrop">
            <Tag style={{ minWidth: 0 }} />
          </Dialog.Popup>
        );
      `,
      filename: FRONT_FILENAME,
      errors: [
        {
          messageId: 'stylingPropOnTwentyUiComponent',
          data: { propName: 'className', componentName: 'Dialog.Popup' },
        },
        {
          messageId: 'stylingPropOnTwentyUiComponent',
          data: {
            propName: 'backdropClassName',
            componentName: 'Dialog.Popup',
          },
        },
        {
          messageId: 'stylingPropOnTwentyUiComponent',
          data: { propName: 'style', componentName: 'Tag' },
        },
      ],
    },
    {
      code: `
        import { css } from '@linaria/core';
        import { styled } from '@linaria/react';

        const StyledNavigationBar = styled.div\`
          --tw-button-size: 40px;
        \`;

        const cardClassName = css\`
          display: flex;
          --card-background-color: transparent;
        \`;
      `,
      filename: FRONT_FILENAME,
      errors: [
        {
          messageId: 'privateCssVariableWrite',
          data: { variableName: '--tw-button-size' },
        },
        {
          messageId: 'privateCssVariableWrite',
          data: { variableName: '--card-background-color' },
        },
      ],
    },
    {
      code: `
        const Example = () => <div style={{ '--tw-button-radius': '4px' }} />;

        element.style.setProperty('--tw-button-color', 'white');
      `,
      filename: FRONT_FILENAME,
      errors: [
        {
          messageId: 'privateCssVariableWrite',
          data: { variableName: '--tw-button-radius' },
        },
        {
          messageId: 'privateCssVariableWrite',
          data: { variableName: '--tw-button-color' },
        },
      ],
    },
    {
      code: `
        import { styled } from '@linaria/react';

        const StyledPill = styled.div\`
          > span[data-badge-size] {
            border: none;
          }
        \`;

        const StyledPreview = styled.div\`
          [data-anchor-hidden] & {
            visibility: hidden;
          }
        \`;
      `,
      filename: FRONT_FILENAME,
      errors: [
        {
          messageId: 'privateTwentyUiAttribute',
          data: { attributeName: 'data-badge-size' },
        },
        {
          messageId: 'privateTwentyUiAttribute',
          data: { attributeName: 'data-anchor-hidden' },
        },
      ],
    },
    {
      code: `
        const item = dropdownContent?.querySelector('[data-dropdown-item]');
        const skeleton = element.closest(\`[data-skeleton]\`);
        const isGrouped = element.matches('[data-grouped="true"]');
      `,
      filename: FRONT_FILENAME,
      errors: [
        {
          messageId: 'privateTwentyUiAttribute',
          data: { attributeName: 'data-dropdown-item' },
        },
        {
          messageId: 'privateTwentyUiAttribute',
          data: { attributeName: 'data-skeleton' },
        },
        {
          messageId: 'privateTwentyUiAttribute',
          data: { attributeName: 'data-grouped' },
        },
      ],
    },
    {
      code: `
        import { styled } from '@linaria/react';
        import { Tag } from 'twenty-ui/primitives/data-display';

        const StyledTag = styled(Tag)\`
          && {
            min-width: fit-content !important;
          }
        \`;
      `,
      filename: FRONT_FILENAME,
      errors: [
        {
          messageId: 'styledTwentyUiComponent',
          data: { componentName: 'Tag' },
        },
        { messageId: 'doubleAmpersandSelector' },
        { messageId: 'importantDeclaration' },
      ],
    },
    {
      code: `
        import { styled } from '@linaria/react';
        import { Tag } from 'twenty-ui/primitives/data-display';

        const StyledTag = styled(Tag)\`
          /* no && or !important needed since the cascade layer */
          content: '!important';
          flex-shrink: 0;
        \`;
      `,
      filename: FRONT_FILENAME,
      errors: [
        {
          messageId: 'styledTwentyUiComponent',
          data: { componentName: 'Tag' },
        },
      ],
    },
  ],
});

describe('twenty-ui override exemptions', () => {
  it('records existing files with a reason', () => {
    const invalidExemptionFilePaths = TWENTY_UI_OVERRIDE_EXEMPTIONS.filter(
      ({ filePath, reason }) =>
        !existsSync(join(REPOSITORY_ROOT, filePath)) ||
        !isNonEmptyString(reason),
    ).map(({ filePath }) => filePath);

    expect(invalidExemptionFilePaths).toEqual([]);
  });
});
