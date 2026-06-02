import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from '@utils/is-defined';
import { themeCssVariables } from 'twenty-sdk/ui';

type HtmlPreviewProps = {
  html: string | null | undefined;
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
