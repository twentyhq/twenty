import { type CSSProperties, useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { DOCUMENT_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { Markdown } from 'src/utils/markdown-to-react';

const useCurrentRecordId = (): string | null =>
  useFrontComponentExecutionContext((context) =>
    context.recordId ??
    (context.selectedRecordIds.length === 1
      ? context.selectedRecordIds[0]
      : null),
  );

const styles: Record<string, CSSProperties> = {
  scroll: { height: '100%', overflow: 'auto', background: '#eef1f6', padding: '24px' },
  paper: {
    maxWidth: '720px',
    margin: '0 auto',
    background: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 10px 40px rgba(24, 39, 75, 0.08)',
    overflow: 'hidden',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif",
  },
  body: { padding: '48px 56px 56px' },
  empty: { padding: '40px', textAlign: 'center', color: '#6b7280', fontFamily: 'sans-serif' },
  actions: {
    maxWidth: '720px',
    margin: '0 auto 16px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif",
  },
  actionLink: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#1961ed',
    background: '#ffffff',
    border: '1px solid #d7deee',
    borderRadius: '6px',
    padding: '6px 12px',
    textDecoration: 'none',
  },
};

type LoadedDocument = { name: string; content: string; pdfUrl?: string };

const DocumentViewer = () => {
  const recordId = useCurrentRecordId();
  const [document, setDocument] = useState<LoadedDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!recordId) {
      setLoading(false);
      return;
    }
    // Reset while the newly-selected document loads, so the previous one isn't
    // shown against the new record.
    setLoading(true);
    setDocument(null);
    let cancelled = false;
    const load = async () => {
      const { documents } = await new CoreApiClient().query({
        documents: {
          __args: { filter: { id: { eq: recordId } }, first: 1 },
          edges: {
            node: { id: true, name: true, content: true, file: { url: true } },
          },
        },
      });
      if (cancelled) return;
      const node = documents?.edges?.[0]?.node;
      setDocument({
        name: node?.name ?? 'Document',
        content: node?.content ?? '',
        pdfUrl: node?.file?.[0]?.url ?? undefined,
      });
    };
    load().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [recordId]);

  if (loading || !document) {
    return <div style={styles.empty}>{loading ? 'Loading…' : 'Open a document to preview it here.'}</div>;
  }

  const webUrl = new RestApiClient().resolveUrl('/s/documents/view', {
    query: { id: recordId },
  });

  return (
    <div style={styles.scroll}>
      <div style={styles.actions}>
        <a style={styles.actionLink} href={webUrl} target="_blank" rel="noopener noreferrer">
          Open web page
        </a>
        {document.pdfUrl ? (
          <a style={styles.actionLink} href={document.pdfUrl} target="_blank" rel="noopener noreferrer">
            Download PDF
          </a>
        ) : null}
      </div>
      <div style={styles.paper}>
        <div style={styles.body}>
          <Markdown content={document.content} />
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: DOCUMENT_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'document-viewer',
  description: 'Renders a generated document as a styled, printable preview.',
  component: DocumentViewer,
});
