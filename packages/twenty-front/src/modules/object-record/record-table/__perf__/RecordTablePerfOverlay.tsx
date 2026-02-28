import { useEffect, useState } from 'react';
import { RecordTableCellPerformanceAudit } from './RecordTableCellPerformanceAudit';
import { RecordTableStateAccessAudit } from './RecordTableStateAccessAudit';

// Dev-only overlay to run perf benchmarks on the actual app.
// Open DevTools console and run: window.__SHOW_TABLE_PERF = true
// Or press Ctrl+Shift+P to toggle.

declare global {
  interface Window {
    __SHOW_TABLE_PERF?: boolean;
  }
}

export const RecordTablePerfOverlay = () => {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<'cell' | 'state'>('cell');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setVisible((prev) => !prev);
      }
    };

    const interval = setInterval(() => {
      if (window.__SHOW_TABLE_PERF && !visible) {
        setVisible(true);
      }
    }, 500);

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        background: 'white',
        overflow: 'auto',
        padding: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          alignItems: 'center',
        }}
      >
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
        <button
          onClick={() => {
            setVisible(false);
            window.__SHOW_TABLE_PERF = false;
          }}
          style={{ marginLeft: 'auto' }}
        >
          Close (Ctrl+Shift+P)
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
