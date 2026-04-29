import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';

import { SALES_NOTE_SUMMARY_VIEWER_UID } from 'src/constants/universal-identifiers';

// Inline styles only — emotion / Linaria break in the app sandbox
// (see deploy-twenty-app skill).
const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
};

const contentStyle: React.CSSProperties = {
  lineHeight: 1.7,
  padding: '20px 24px',
  fontSize: '13.5px',
  color: '#333',
  maxHeight: '500px',
  overflowY: 'auto',
};

const emptyStyle: React.CSSProperties = {
  ...contentStyle,
  color: '#888',
  fontStyle: 'italic',
};

// Raw fetch (mirrors the pattern in stratum-quote-app); CoreApiClient has
// shown sandbox issues so we go direct.
const fetchSalesNoteSummary = async (
  id: string,
): Promise<string | null> => {
  const baseUrl = process.env.TWENTY_API_URL ?? '';
  const apiUrl = baseUrl.endsWith('/graphql') ? baseUrl : `${baseUrl}/graphql`;
  const token = process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify({
      query: `
        query GetSalesNoteSummary($id: UUID!) {
          salesNote(filter: { id: { eq: $id } }) {
            summary { markdown }
          }
        }
      `,
      variables: { id },
    }),
  });
  const json = (await response.json()) as {
    data?: { salesNote?: { summary?: { markdown?: string | null } | null } | null };
    errors?: { message: string }[];
  };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data?.salesNote?.summary?.markdown ?? null;
};

const SalesNoteSummaryViewer = () => {
  const recordId = useRecordId();
  const [markdown, setMarkdown] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (recordId == null) {
      setLoading(false);
      return;
    }
    fetchSalesNoteSummary(recordId)
      .then((md) => {
        setMarkdown(md);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [recordId]);

  if (loading) {
    return (
      <div style={cardStyle}>
        <div style={emptyStyle}>Loading summary…</div>
      </div>
    );
  }

  if (markdown == null || markdown.trim().length === 0) {
    return (
      <div style={cardStyle}>
        <div style={emptyStyle}>
          No summary yet. Add some notes and the AI will summarise them.
        </div>
      </div>
    );
  }
  const text: string = markdown;

  return (
    <div style={cardStyle}>
      <div style={contentStyle}>
        <Markdown>{text}</Markdown>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: SALES_NOTE_SUMMARY_VIEWER_UID,
  name: 'sales-note-summary-viewer',
  description:
    'Renders the AI-generated summary of a sales note in markdown format.',
  component: SalesNoteSummaryViewer,
});
