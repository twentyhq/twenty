import { isDefined } from '@utils/is-defined';
import { Callout } from 'twenty-ui/feedback';
import { IconAlertCircle } from 'twenty-ui/icon';
import { type ThemeType, useTheme } from 'twenty-ui/theme-constants';

import { HtmlPreview } from '@modules/resend/html-viewer/components/HtmlPreview';
import { useRecordHtml } from '@modules/resend/html-viewer/hooks/useRecordHtml';

type RecordHtmlViewerProps = {
  objectName: string;
  loadingText: string;
};

const getStyles = (theme: ThemeType): Record<string, React.CSSProperties> => {
  const stateContainer: React.CSSProperties = {
    padding: theme.spacing[4],
    fontFamily: theme.font.family,
    height: '100%',
    boxSizing: 'border-box',
  };

  return {
    stateContainer,
    loader: {
      ...stateContainer,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.font.color.tertiary,
      fontSize: theme.font.size.sm,
    },
    previewWrapper: {
      width: '100%',
      height: '100%',
      background: theme.background.secondary,
      border: `1px solid ${theme.border.color.light}`,
      borderRadius: theme.border.radius.md,
      overflow: 'hidden',
      boxSizing: 'border-box',
    },
  };
};

export const RecordHtmlViewer = ({
  objectName,
  loadingText,
}: RecordHtmlViewerProps) => {
  const { html, loading, error } = useRecordHtml(objectName);
  const theme = useTheme();
  const styles = getStyles(theme);

  if (loading) {
    return <div style={styles.loader}>{loadingText}</div>;
  }

  if (isDefined(error)) {
    return (
      <div style={styles.stateContainer}>
        <Callout
          variant="error"
          title="Failed to load content"
          description={error}
          Icon={IconAlertCircle}
        />
      </div>
    );
  }

  return (
    <div style={styles.previewWrapper}>
      <HtmlPreview html={html} />
    </div>
  );
};
