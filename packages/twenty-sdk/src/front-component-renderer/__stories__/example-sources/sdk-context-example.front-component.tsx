import { useState } from 'react';
import {
  defineFrontComponent,
  useFrontComponentExecutionContext,
  useUserId,
} from '@/sdk';

const CARD_STYLE = {
  padding: 24,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 16,
  fontFamily: 'system-ui, sans-serif',
  background: '#f0f9ff',
  borderRadius: 12,
  border: '2px solid #38bdf8',
  maxWidth: 400,
};

const LABEL_STYLE = {
  fontSize: 12,
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
};

const VALUE_STYLE = {
  fontSize: 16,
  fontWeight: 700,
  color: '#0c4a6e',
  wordBreak: 'break-all' as const,
};

const SdkContextComponent = () => {
  const [renderCount, setRenderCount] = useState(0);

  const userId = useUserId();

  const fullContext = useFrontComponentExecutionContext(
    (context) => context,
  );

  return (
    <div data-testid="sdk-context-component" style={CARD_STYLE}>
      <h2
        style={{
          color: '#0369a1',
          fontWeight: 700,
          fontSize: 18,
          margin: 0,
        }}
      >
        SDK Context
      </h2>

      <div>
        <p style={LABEL_STYLE}>User ID (useUserId)</p>
        <p data-testid="sdk-context-user-id" style={VALUE_STYLE}>
          {userId ?? 'null'}
        </p>
      </div>

      <div>
        <p style={LABEL_STYLE}>Full Context (JSON)</p>
        <pre
          data-testid="sdk-context-json"
          style={{
            ...VALUE_STYLE,
            fontSize: 13,
            background: '#e0f2fe',
            padding: 12,
            borderRadius: 8,
            overflow: 'auto',
          }}
        >
          {JSON.stringify(fullContext, null, 2) ?? 'undefined'}
        </pre>
      </div>

      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <button
          data-testid="sdk-context-button"
          onClick={() => setRenderCount((previous) => previous + 1)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0284c7',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Re-render
        </button>
        <span
          data-testid="sdk-context-render-count"
          style={{ fontSize: 14, color: '#475569' }}
        >
          Renders: {renderCount}
        </span>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-sdkc-0000-0000-0000-000000000011',
  name: 'sdk-context-component',
  description:
    'A front component that uses SDK context hooks (useFrontComponentExecutionContext, useUserId)',
  component: SdkContextComponent,
});
