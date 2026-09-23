import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { IconInfoCircle } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import {
  THEME_DARK,
  THEME_LIGHT,
  ThemeProvider,
  type ThemeType,
  useTheme,
  useThemeColorScheme,
} from 'twenty-ui/theme';

const TokenSizedIcon = () => {
  const theme = useTheme();
  const colorScheme = useThemeColorScheme();

  return (
    <>
      <div
        data-testid="theme-token-icon-wrapper"
        style={{ display: 'inline-flex' }}
      >
        <IconInfoCircle size={theme.icon.size.md} />
      </div>
      <output aria-label="Static theme color">
        {theme.font.color.primary}
      </output>
      <output aria-label="Static color scheme">{colorScheme}</output>
    </>
  );
};

const HostThemeTokens = () => {
  const theme = useTheme();

  return (
    <output
      aria-label="Host theme color"
      style={{ color: theme.font.color.primary }}
    >
      {theme.font.color.primary}
    </output>
  );
};

const ThemeTokensComponent = () => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const theme = colorScheme === 'dark' ? THEME_DARK : THEME_LIGHT;

  return (
    <>
      <HostThemeTokens />
      <ThemeProvider
        colorScheme={colorScheme}
        applyToRoot={false}
        theme={theme as unknown as ThemeType}
      >
        <TokenSizedIcon />
        <Button onClick={() => setColorScheme('dark')}>Use dark values</Button>
      </ThemeProvider>
    </>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000113',
  name: 'twenty-ui-theme-tokens',
  description:
    'Exercises host CSS variables and explicit static ThemeProvider values',
  component: ThemeTokensComponent,
});
