import { RecordTableCellPerformanceAudit } from '@/object-record/record-table/__perf__/RecordTableCellPerformanceAudit';
import { RecordTableStateAccessAudit } from '@/object-record/record-table/__perf__/RecordTableStateAccessAudit';
import { useState } from 'react';

export const RecordTablePerfPage = () => {
  const [tab, setTab] = useState<'cell' | 'state'>('cell');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#fff' }}>
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid #e2e8f0',
          padding: '0 16px',
          background: '#f8fafc',
        }}
      >
        {(['cell', 'state'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? '#2563eb' : '#64748b',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {t === 'cell' ? 'Cell Render Benchmark' : 'State Access Benchmark'}
          </button>
        ))}
      </div>
      {tab === 'cell' ? (
        <RecordTableCellPerformanceAudit />
      ) : (
        <RecordTableStateAccessAudit />
      )}
    </div>
  );
};
