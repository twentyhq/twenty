import { RecordTableCellPerformanceAudit } from '@/object-record/record-table/__perf__/RecordTableCellPerformanceAudit';
import { RecordTableStateAccessAudit } from '@/object-record/record-table/__perf__/RecordTableStateAccessAudit';
import { useState } from 'react';

export const RecordTablePerfPage = () => {
  const [tab, setTab] = useState<'cell' | 'state'>('cell');

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setTab('cell')}
          style={{ fontWeight: tab === 'cell' ? 'bold' : 'normal' }}
        >
          Cell Render Benchmark
        </button>
        <button
          onClick={() => setTab('state')}
          style={{ fontWeight: tab === 'state' ? 'bold' : 'normal' }}
        >
          State Access Benchmark
        </button>
      </div>
      {tab === 'cell' ? (
        <RecordTableCellPerformanceAudit />
      ) : (
        <RecordTableStateAccessAudit />
      )}
    </div>
  );
};
