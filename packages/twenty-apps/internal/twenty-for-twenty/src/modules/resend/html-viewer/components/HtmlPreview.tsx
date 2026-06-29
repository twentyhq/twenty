import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from '@utils/is-defined';
import { type ThemeType, useTheme } from 'twenty-ui/theme-constants';

type HtmlPreviewProps = {
  html: string | null | undefined;
};

const getStyles = (theme: ThemeType): Record<string, React.CSSProperties> => ({
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: theme.spacing[4],
    fontFamily: theme.font.family,
    fontSize: theme.font.size.sm,
    color: theme.font.color.tertiary,
    background: theme.background.secondary,
    boxSizing: 'border-box',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    background: theme.background.primary,
  },
});

export const HtmlPreview = ({ html }: HtmlPreviewProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);

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
