import { defineFrontComponent } from 'twenty-sdk/define';

import { RecordHtmlViewer } from 'src/modules/resend/html-viewer/components/RecordHtmlViewer';
import { EMAIL_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/constants/universal-identifiers';

const EmailHtmlViewer = () => (
  <RecordHtmlViewer objectName="resendEmail" loadingText="Loading email..." />
);

export default defineFrontComponent({
  universalIdentifier: EMAIL_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Email HTML Viewer',
  description: 'Renders the HTML body of a Resend email',
  component: EmailHtmlViewer,
});
