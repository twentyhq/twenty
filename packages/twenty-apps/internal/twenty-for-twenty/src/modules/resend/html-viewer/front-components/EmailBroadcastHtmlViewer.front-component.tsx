import { isDefined } from '@utils/is-defined';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Callout } from 'twenty-ui/feedback';
import { IconAlertCircle, IconInfoCircle } from 'twenty-ui/icon';
import { type ThemeType, useTheme } from 'twenty-ui/theme-constants';

import { EMAIL_BROADCAST_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from '@modules/resend/constants/universal-identifiers';
import { HtmlPreview } from '@modules/resend/html-viewer/components/HtmlPreview';
import { useRelatedBroadcastHtml } from '@modules/resend/html-viewer/hooks/useRelatedBroadcastHtml';

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

const EmailBroadcastHtmlViewer = () => {
  const { html, loading, error, hasBroadcast } = useRelatedBroadcastHtml();
  const theme = useTheme();
  const styles = getStyles(theme);

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
