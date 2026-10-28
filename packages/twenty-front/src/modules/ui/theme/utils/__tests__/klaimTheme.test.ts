// oxlint-disable twenty/no-hardcoded-colors -- These assertions lock the reference palette.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const themeDirectory = resolve(__dirname, '../..');
const themeStyles = readFileSync(
  resolve(themeDirectory, 'klaim-theme.css'),
  'utf8',
);
const defaultThemeStyles = readFileSync(
  resolve(themeDirectory, '../../../../../twenty-ui/src/theme/theme-light.css'),
  'utf8',
);

describe('Klaim theme', () => {
  let styleElement: HTMLStyleElement;

  beforeEach(() => {
    styleElement = document.createElement('style');
    styleElement.textContent = themeStyles;
    document.head.appendChild(styleElement);
    document.documentElement.className = 'light';
  });

  afterEach(() => {
    styleElement.remove();
    document.documentElement.className = '';
  });

  it('applies the reference palette to CRM surfaces and actions', () => {
    const styles = getComputedStyle(document.documentElement);

    expect(styles.getPropertyValue('--t-background-primary')).toBe('#fff');
    expect(styles.getPropertyValue('--t-background-secondary')).toBe('#f9f9fc');
    expect(styles.getPropertyValue('--t-font-color-primary')).toBe('#2e2d4d');
    expect(styles.getPropertyValue('--t-background-primary-inverted')).toBe(
      '#182842',
    );
    expect(styles.getPropertyValue('--t-accent-primary')).toBe('#80eee0');
    expect(styles.getPropertyValue('--t-background-transparent-light')).toBe(
      '#e8f8f3',
    );
  });

  it('does not override dark mode', () => {
    document.documentElement.className = 'dark';

    expect(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--t-background-primary',
      ),
    ).toBe('');
  });

  it('leaves interface scaling and typography sizes to the existing theme', () => {
    expect(themeStyles).not.toMatch(/--t-(?:scale|zoom|font-size|spacing)/);
  });

  it('only overrides existing public theme tokens', () => {
    const defaultProperties = new Set(
      defaultThemeStyles.match(/--t-[\w-]+(?=:)/g),
    );
    const brandedProperties = themeStyles.match(/--t-[\w-]+(?=:)/g) ?? [];

    expect(brandedProperties.length).toBeGreaterThan(0);

    for (const property of brandedProperties) {
      expect(defaultProperties.has(property)).toBe(true);
    }
  });
});
