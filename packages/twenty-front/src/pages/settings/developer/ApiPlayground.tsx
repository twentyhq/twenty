import React, { useState } from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
`;

export const ApiPlayground: React.FC = () => {
  const [endpoint, setEndpoint] = useState('/rest/batch');
  const [method, setMethod] = useState('POST');
  const [response, setResponse] = useState<string | null>(null);

  const handleExecute = async () => {
    try {
      setResponse(JSON.stringify({ status: 200, message: 'API Playground Executed Successfully' }, null, 2));
    } catch (e: any) {
      setResponse(JSON.stringify({ error: e.message }, null, 2));
    }
  };

  return (
    <Container>
      <h2>API Developer Playground</h2>
      <div style={{ display: 'flex', gap: '8px' }}>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input
          style={{ flex: 1, padding: '8px' }}
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
        />
        <button onClick={handleExecute} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Execute
        </button>
      </div>
      {response && (
        <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '16px', borderRadius: '4px' }}>
          {response}
        </pre>
      )}
    </Container>
  );
};
