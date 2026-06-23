import { isDefined } from '@utils/is-defined';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Callout, IconAlertCircle, IconInfoCircle } from 'twenty-sdk/ui';

import { EMAIL_BROADCAST_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from '@modules/resend/constants/universal-identifiers';
import { HtmlPreview } from '@modules/resend/html-viewer/components/HtmlPreview';
import { useRelatedBroadcastHtml } from '@modules/resend/html-viewer/hooks/useRelatedBroadcastHtml';

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

const EmailBroadcastHtmlViewer = () => {
  const { html, loading, error, hasBroadcast } = useRelatedBroadcastHtml();
  const styles = getStyles();

  if (loading) {
    return <div style={styles.loader}>Loading broadcast preview...</div>;
  }

  if (isDefined(error)) {
    return (
      <div style={styles.stateContainer}>
        <Callout
          variant="error"
          title="Failed to load broadcast preview"
          description={error}
          Icon={IconAlertCircle}
        />
      </div>
    );
  }

  if (!hasBroadcast) {
    return (
      <div style={styles.stateContainer}>
        <Callout
          variant="info"
          title="No broadcast linked"
          description="This email is not linked to a broadcast, so there is no HTML preview to display."
          Icon={IconInfoCircle}
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

export default defineFrontComponent({
  universalIdentifier:
    EMAIL_BROADCAST_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Email Broadcast HTML Viewer',
  description:
    'Renders the HTML body of the broadcast linked to a Resend email',
  component: EmailBroadcastHtmlViewer,
});
