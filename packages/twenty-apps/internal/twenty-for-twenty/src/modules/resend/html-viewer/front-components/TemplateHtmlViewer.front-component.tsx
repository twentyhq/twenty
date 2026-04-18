import { defineFrontComponent } from 'twenty-sdk/define';

import { RecordHtmlViewer } from 'src/modules/resend/html-viewer/components/RecordHtmlViewer';
import { TEMPLATE_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/constants/universal-identifiers';

const TemplateHtmlViewer = () => (
  <RecordHtmlViewer
    objectName="resendTemplate"
    loadingText="Loading template..."
  />
);

export default defineFrontComponent({
  universalIdentifier:
    TEMPLATE_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Template HTML Viewer',
  description: 'Renders the HTML body of a Resend email template',
  component: TemplateHtmlViewer,
});
