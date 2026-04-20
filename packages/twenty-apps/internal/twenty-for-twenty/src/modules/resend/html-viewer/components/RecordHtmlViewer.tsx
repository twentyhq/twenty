import { isDefined } from 'twenty-shared/utils';

import { HtmlPreview } from 'src/modules/resend/html-viewer/components/HtmlPreview';
import { useRecordHtml } from 'src/modules/resend/html-viewer/hooks/useRecordHtml';

type RecordHtmlViewerProps = {
  objectName: string;
  loadingText: string;
};

export const RecordHtmlViewer = ({
  objectName,
  loadingText,
}: RecordHtmlViewerProps) => {
  const { html, loading, error } = useRecordHtml(objectName);

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
        {loadingText}
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
