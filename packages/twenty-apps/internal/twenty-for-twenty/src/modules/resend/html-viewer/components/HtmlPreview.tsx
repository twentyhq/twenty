import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from '@utils/is-defined';

type HtmlPreviewProps = {
  html: string | null | undefined;
};

// Workaround: 'twenty-sdk/ui' currently fails typecheck because it re-exports
// from the unresolvable 'twenty-ui-deprecated'. Inline only the theme tokens
// this component uses, keeping the same runtime CSS-variable values. Revert to
// `import { themeCssVariables } from 'twenty-sdk/ui'` once the SDK export is fixed.
const themeCssVariables = {
  spacing: {
    '4': 'var(--t-spacing-4)',
  },
  background: {
    primary: 'var(--t-background-primary)',
    secondary: 'var(--t-background-secondary)',
  },
  font: {
    color: {
      tertiary: 'var(--t-font-color-tertiary)',
    },
    size: {
      sm: 'var(--t-font-size-sm)',
    },
    family: 'var(--t-font-family)',
  },
};

// Styles are computed lazily inside the component body because the SDK
// mocks `twenty-sdk/ui` at manifest-build time, which leaves
// `themeCssVariables` undefined during static module evaluation.
const getStyles = (): Record<string, React.CSSProperties> => ({
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: themeCssVariables.spacing[4],
    fontFamily: themeCssVariables.font.family,
    fontSize: themeCssVariables.font.size.sm,
    color: themeCssVariables.font.color.tertiary,
    background: themeCssVariables.background.secondary,
    boxSizing: 'border-box',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    background: themeCssVariables.background.primary,
  },
});

export const HtmlPreview = ({ html }: HtmlPreviewProps) => {
  const styles = getStyles();

  if (!isDefined(html) || !isNonEmptyString(html)) {
    return <div style={styles.emptyState}>No HTML content available</div>;
  }

  return (
    <iframe
      srcDoc={html}
      sandbox=""
      title="Email HTML preview"
      style={styles.iframe}
    />
  );
};
