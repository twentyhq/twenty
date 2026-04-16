import { defineFrontComponent } from 'twenty-sdk';
import { isDefined } from 'twenty-shared/utils';

import { HtmlPreview } from 'src/components/HtmlPreview';
import { TEMPLATE_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/template-html-viewer-front-component-universal-identifier';
import { useRecordHtml } from 'src/hooks/useRecordHtml';

const TemplateHtmlViewer = () => {
  const { html, loading, error } = useRecordHtml('resendTemplate');

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#999',
          fontFamily: 'sans-serif',
          fontSize: '14px',
        }}
      >
        Loading template...
      </div>
    );
  }

  if (isDefined(error)) {
    return (
      <div
        style={{
          padding: '16px',
          color: '#999',
          fontFamily: 'sans-serif',
          fontSize: '13px',
        }}
      >
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <HtmlPreview html={html} />
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    TEMPLATE_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Template HTML Viewer',
  description: 'Renders the HTML body of a Resend email template',
  component: TemplateHtmlViewer,
});
