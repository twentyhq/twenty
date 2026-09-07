import { defineFrontComponent } from 'twenty-sdk/define';
import { IconInfoCircle } from 'twenty-ui/icon';
import { ThemeProvider, useTheme } from 'twenty-ui/theme-constants';

const TokenSizedIcon = () => {
  const theme = useTheme();

  return (
    <div
      data-testid="theme-token-icon-wrapper"
      style={{ display: 'inline-flex' }}
    >
      <IconInfoCircle size={theme.icon.size.md} />
    </div>
  );
};

const ThemeTokensComponent = () => (
  <ThemeProvider colorScheme="light">
    <TokenSizedIcon />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000113',
  name: 'twenty-ui-theme-tokens',
  description:
    'Renders an icon sized from a useTheme() design token under ThemeProvider in the sandbox',
  component: ThemeTokensComponent,
});
