import { useEffect, useRef } from 'react';

// Drop-in profiler to measure render times of individual components.
// Import and call at the top of any component:
//   useRecordTableRenderProfiler('RecordTableCell');
//
// Results are batched and logged every 2 seconds to avoid console spam.
// Enable by setting window.__RECORD_TABLE_PROFILE = true in DevTools console.

type TimingEntry = {
  component: string;
  renderMs: number;
};

const timingBuffer: TimingEntry[] = [];
let flushScheduled = false;

const flushTimings = () => {
  if (timingBuffer.length === 0) return;

  const grouped: Record<string, { count: number; totalMs: number; maxMs: number }> = {};

  for (const entry of timingBuffer) {
    const existing = grouped[entry.component];
    if (existing) {
      existing.count++;
      existing.totalMs += entry.renderMs;
      existing.maxMs = Math.max(existing.maxMs, entry.renderMs);
    } else {
      grouped[entry.component] = {
        count: 1,
        totalMs: entry.renderMs,
        maxMs: entry.renderMs,
      };
    }
  }

  // eslint-disable-next-line no-console
  console.group(`[RecordTable Profiler] ${timingBuffer.length} renders`);
  for (const [name, stats] of Object.entries(grouped).sort(
    (a, b) => b[1].totalMs - a[1].totalMs,
  )) {
    // eslint-disable-next-line no-console
    console.log(
      `${name}: ${stats.count} renders, ` +
        `total=${stats.totalMs.toFixed(2)}ms, ` +
        `avg=${(stats.totalMs / stats.count).toFixed(3)}ms, ` +
        `max=${stats.maxMs.toFixed(3)}ms`,
    );
  }
  // eslint-disable-next-line no-console
  console.groupEnd();

  timingBuffer.length = 0;
  flushScheduled = false;
};

const scheduleFlush = () => {
  if (!flushScheduled) {
    flushScheduled = true;
    setTimeout(flushTimings, 2000);
  }
};

declare global {
  interface Window {
    __RECORD_TABLE_PROFILE?: boolean;
  }
}

export const useRecordTableRenderProfiler = (componentName: string) => {
  const startTime = useRef(performance.now());
  startTime.current = performance.now();

  useEffect(() => {
    if (!window.__RECORD_TABLE_PROFILE) return;

    const elapsed = performance.now() - startTime.current;
    timingBuffer.push({ component: componentName, renderMs: elapsed });
    scheduleFlush();
  });
};
