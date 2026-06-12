import { isDefined } from '@utils/is-defined';
import { Callout, IconAlertCircle, themeCssVariables } from 'twenty-sdk/ui';

import { HtmlPreview } from '@modules/resend/html-viewer/components/HtmlPreview';
import { useRecordHtml } from '@modules/resend/html-viewer/hooks/useRecordHtml';

type RecordHtmlViewerProps = {
  objectName: string;
  loadingText: string;
};

// Styles are computed lazily inside the component body because the SDK
// mocks `twenty-sdk/ui` at manifest-build time, which leaves
// `themeCssVariables` undefined during static module evaluation.
const getStyles = (): Record<string, React.CSSProperties> => {
  const stateContainer: React.CSSProperties = {
    padding: themeCssVariables.spacing[4],
    fontFamily: themeCssVariables.font.family,
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
      color: themeCssVariables.font.color.tertiary,
      fontSize: themeCssVariables.font.size.sm,
    },
    previewWrapper: {
      width: '100%',
      height: '100%',
      background: themeCssVariables.background.secondary,
      border: `1px solid ${themeCssVariables.border.color.light}`,
      borderRadius: themeCssVariables.border.radius.md,
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
  const styles = getStyles();

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
