import { defineFrontComponent } from 'twenty-sdk';

import { RecordHtmlViewer } from 'src/components/RecordHtmlViewer';
import { EMAIL_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const EmailHtmlViewer = () => (
  <RecordHtmlViewer objectName="resendEmail" loadingText="Loading email..." />
);

export default defineFrontComponent({
  universalIdentifier: EMAIL_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Email HTML Viewer',
  description: 'Renders the HTML body of a Resend email',
  component: EmailHtmlViewer,
});
