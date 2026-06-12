import { useCallback, useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

export const CARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '88c15ae2-5f87-4a6b-b48f-1974bbe62eb7';

type PostCardRecord = {
  name: string;
  content: string;
  status: string;
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#999',
  SENT: '#e88c30',
  DELIVERED: '#4caf50',
  RETURNED: '#e05252',
};

const CardDisplay = ({
  name,
  content,
  status,
}: {
  name: string;
  content: string;
  status: string;
}) => {
  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 600, color: '#333' }}>
          {name || 'Untitled'}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '4px',
            color: '#fff',
            backgroundColor: STATUS_COLORS[status] ?? '#999',
          }}
        >
          {status}
        </span>
      </div>

      <p
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#555',
          margin: 0,
          whiteSpace: 'pre-line',
        }}
      >
        {content || 'No content yet...'}
      </p>
    </div>
  );
};

const PostCardPreview = () => {
  const recordId = useRecordId();
  const [postCard, setPostCard] = useState<PostCardRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPostCard = useCallback(async () => {
    if (!isDefined(recordId)) {
      setLoading(false);
      setError('No record ID');
      return;
    }

    try {
      setError(null);
      const client = new CoreApiClient();

      const result = await client.query({
        postCard: {
          __args: {
            filter: { id: { eq: recordId } },
          },
          name: true,
          content: true,
          status: true,
        },
      });

      const record = result?.postCard;

      if (!isDefined(record)) {
        setError('Record not found');
        setPostCard(null);
      } else {
        setPostCard({
          name: record.name ?? '',
          content: record.content ?? '',
          status: record.status ?? 'DRAFT',
        });
      }
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : String(fetchError),
      );
      setPostCard(null);
    }
    setLoading(false);
  }, [recordId]);

  useEffect(() => {
    fetchPostCard();

    const interval = setInterval(fetchPostCard, 3000);

    return () => {
      clearInterval(interval);
      setPostCard(null);
      setLoading(false);
      setError(null);
    };
  }, [fetchPostCard]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#b0a89a',
          fontFamily: 'Georgia, serif',
          fontSize: '14px',
        }}
      >
        Loading postcard...
      </div>
    );
  }

  if (!isDefined(postCard)) {
    return (
      <div
        style={{
          padding: '16px',
          color: '#b0a89a',
          fontFamily: 'sans-serif',
          fontSize: '13px',
        }}
      >
        <div>{error ?? 'No postcard data'}</div>
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#ccc' }}>
          recordId: {recordId ?? 'null'} | apiUrl:{' '}
          {process.env.TWENTY_API_URL ? 'set' : 'missing'} | token:{' '}
          {process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY
            ? 'set'
            : 'missing'}
        </div>
      </div>
    );
  }

  return (
    <CardDisplay
      name={postCard.name}
      content={postCard.content}
      status={postCard.status}
    />
  );
};

export default defineFrontComponent({
  universalIdentifier: CARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'card-component',
  description: 'A component using an external component file',
  component: PostCardPreview,
});
