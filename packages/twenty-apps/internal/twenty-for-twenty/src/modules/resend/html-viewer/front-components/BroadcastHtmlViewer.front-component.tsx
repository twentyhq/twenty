import { defineFrontComponent } from 'twenty-sdk/define';

import { RecordHtmlViewer } from '@modules/resend/html-viewer/components/RecordHtmlViewer';
import { BROADCAST_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from '@modules/resend/constants/universal-identifiers';

const BroadcastHtmlViewer = () => (
  <RecordHtmlViewer
    objectName="resendBroadcast"
    loadingText="Loading broadcast..."
  />
);

export default defineFrontComponent({
  universalIdentifier:
    BROADCAST_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Broadcast HTML Viewer',
  description: 'Renders the HTML body of a Resend broadcast',
  component: BroadcastHtmlViewer,
});
