import { isDefined } from '@utils/is-defined';
import { Callout, IconAlertCircle } from 'twenty-sdk/ui';

import { HtmlPreview } from '@modules/resend/html-viewer/components/HtmlPreview';
import { useRecordHtml } from '@modules/resend/html-viewer/hooks/useRecordHtml';

type RecordHtmlViewerProps = {
  objectName: string;
  loadingText: string;
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
    secondary: 'var(--t-background-secondary)',
  },
  border: {
    color: {
      light: 'var(--t-border-color-light)',
    },
    radius: {
      md: 'var(--t-border-radius-md)',
    },
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
