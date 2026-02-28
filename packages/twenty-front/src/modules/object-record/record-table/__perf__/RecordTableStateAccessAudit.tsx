import { atom, createStore, Provider, useAtomValue } from 'jotai';
import { atomFamily } from 'jotai/utils';
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { LinariaStaticCell as StyledCell } from './perf-linaria-cells';

const ROWS = 200;
const COLS = 10;
const TOTAL_CELLS = ROWS * COLS;
const ITERATIONS = 3;

const gridCss = {
  display: 'grid',
  gridTemplateColumns: `repeat(${COLS}, 120px)`,
  gap: 0,
} as const;

// ---------------------------------------------------------------------------
// Jotai store and atoms
// ---------------------------------------------------------------------------

const perfStore = createStore();

const recordAtomFamily = atomFamily((recordId: string) =>
  atom<Record<string, string>>({
    name: `Name ${recordId}`,
    email: `${recordId}@example.com`,
    phone: '555-0100',
    company: 'Acme Inc',
    city: 'San Francisco',
    role: 'Engineer',
    status: 'Active',
    score: '95',
    department: 'Engineering',
    manager: 'Jane Doe',
  }),
);

const fieldValueSelectorFamily = atomFamily(
  ({ recordId, fieldName }: { recordId: string; fieldName: string }) =>
    atom((get) => get(recordAtomFamily(recordId))?.[fieldName] ?? ''),
  (a, b) => a.recordId === b.recordId && a.fieldName === b.fieldName,
);

const rowSelectedFamily = atomFamily((_recordId: string) => atom(false));

const hoverPositionAtom = atom<{ row: number; col: number } | null>(null);

const cellIsHoveredFamily = atomFamily(
  ({ row, col }: { row: number; col: number }) =>
    atom((get) => {
      const pos = get(hoverPositionAtom);
      return pos !== null && pos.row === row && pos.col === col;
    }),
  (a, b) => a.row === b.row && a.col === b.col,
);

const rowFocusedFamily = atomFamily((_recordId: string) => atom(false));
const rowActiveFamily = atomFamily((_recordId: string) => atom(false));
const rowDraggingFamily = atomFamily((_recordId: string) => atom(false));
const rowPendingFamily = atomFamily((_recordId: string) => atom(false));

// Per-cell permission/metadata atoms (simulating real RecordTable patterns)
const cellReadOnlyFamily = atomFamily(
  (_key: string) => atom(false),
  (a, b) => a === b,
);
const cellForbiddenFamily = atomFamily(
  (_key: string) => atom(false),
  (a, b) => a === b,
);
const cellInputOnlyFamily = atomFamily(
  (_key: string) => atom(false),
  (a, b) => a === b,
);

// Simulating objectMetadataItems global atom (large object read per cell in real code)
const objectMetadataItemsAtom = atom(
  Array.from({ length: 30 }, (_, i) => ({
    id: `obj-${i}`,
    nameSingular: `Object${i}`,
    namePlural: `Object${i}s`,
    fields: Array.from({ length: 20 }, (_, j) => ({
      id: `field-${i}-${j}`,
      name: `field${j}`,
      type: 'TEXT',
    })),
  })),
);

// Heavy derived atom: reads 12 source atoms (simulating real-world derived state)
const cellHeavyComputedFamily = atomFamily(
  ({
    recordId,
    fieldName,
    row,
    col,
  }: {
    recordId: string;
    fieldName: string;
    row: number;
    col: number;
  }) =>
    atom((get) => {
      const value = get(recordAtomFamily(recordId))?.[fieldName] ?? '';
      const isSelected = get(rowSelectedFamily(recordId));
      const isFocused = get(rowFocusedFamily(recordId));
      const isActive = get(rowActiveFamily(recordId));
      const isDragging = get(rowDraggingFamily(recordId));
      const isPending = get(rowPendingFamily(recordId));
      const isHovered = get(cellIsHoveredFamily({ row, col }));
      const isReadOnly = get(cellReadOnlyFamily(`${recordId}-${fieldName}`));
      const isForbidden = get(cellForbiddenFamily(`${recordId}-${fieldName}`));
      const isInputOnly = get(cellInputOnlyFamily(`${recordId}-${fieldName}`));
      const metadata = get(objectMetadataItemsAtom);
      const hoverPos = get(hoverPositionAtom);
      return {
        value,
        isSelected,
        isFocused,
        isActive,
        isDragging,
        isPending,
        isHovered,
        isReadOnly,
        isForbidden,
        isInputOnly,
        metadataCount: metadata.length,
        hasHover: hoverPos !== null,
      };
    }),
  (a, b) =>
    a.recordId === b.recordId &&
    a.fieldName === b.fieldName &&
    a.row === b.row &&
    a.col === b.col,
);

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

const RowContext = createContext({ recordId: '', rowIndex: 0 });
const CellContext = createContext({ column: 0, fieldName: '' });
const FieldValueContext = createContext('');

// Per-row context provider (simulates RecordTableRowContextProvider)
const PerRowProvider = ({
  children,
  recordId,
  rowIndex,
}: {
  children: React.ReactNode;
  recordId: string;
  rowIndex: number;
}) => (
  <RowContext.Provider value={{ recordId, rowIndex }}>
    {children}
  </RowContext.Provider>
);

// Per-cell context provider (simulates RecordTableCellContext + FieldContext)
const PerCellProvider = ({
  children,
  column,
  fieldName,
}: {
  children: React.ReactNode;
  column: number;
  fieldName: string;
}) => (
  <CellContext.Provider value={{ column, fieldName }}>
    {children}
  </CellContext.Provider>
);

// ---------------------------------------------------------------------------
// Cell variants
// ---------------------------------------------------------------------------

// A. Pure prop passing (no state access)
const CellA_Props = ({ value }: { value: string }) => (
  <StyledCell>{value}</StyledCell>
);

// B. One context read
const CellB_OneCtx = () => {
  const { recordId } = useContext(RowContext);
  return <StyledCell>{recordId}</StyledCell>;
};

// C. Two context reads (row + cell)
const CellC_TwoCtx = () => {
  const { recordId } = useContext(RowContext);
  const { fieldName } = useContext(CellContext);
  return <StyledCell>{recordId}-{fieldName}</StyledCell>;
};

// D. Pre-resolved context value (optimal: data pushed from parent via context)
const CellD_PreResolved = () => {
  const value = useContext(FieldValueContext);
  return <StyledCell>{value}</StyledCell>;
};

// E. 1 Jotai selector (derived atom from recordAtomFamily)
const CellE_OneSelector = ({
  recordId,
  fieldName,
}: {
  recordId: string;
  fieldName: string;
}) => {
  const value = useAtomValue(fieldValueSelectorFamily({ recordId, fieldName }));
  return <StyledCell>{value}</StyledCell>;
};

// F. 3 Jotai atoms (value + selected + hovered — real cell pattern)
const CellF_ThreeAtoms = ({
  recordId,
  fieldName,
  row,
  col,
}: {
  recordId: string;
  fieldName: string;
  row: number;
  col: number;
}) => {
  const value = useAtomValue(fieldValueSelectorFamily({ recordId, fieldName }));
  useAtomValue(rowSelectedFamily(recordId));
  useAtomValue(cellIsHoveredFamily({ row, col }));
  return <StyledCell>{value}</StyledCell>;
};

// G. 8 Jotai atoms per cell (value + selected + hovered + focused + active + dragging + pending + readOnly)
const CellG_EightAtoms = ({
  recordId,
  fieldName,
  row,
  col,
}: {
  recordId: string;
  fieldName: string;
  row: number;
  col: number;
}) => {
  const value = useAtomValue(fieldValueSelectorFamily({ recordId, fieldName }));
  useAtomValue(rowSelectedFamily(recordId));
  useAtomValue(cellIsHoveredFamily({ row, col }));
  useAtomValue(rowFocusedFamily(recordId));
  useAtomValue(rowActiveFamily(recordId));
  useAtomValue(rowDraggingFamily(recordId));
  useAtomValue(rowPendingFamily(recordId));
  useAtomValue(cellReadOnlyFamily(`${recordId}-${fieldName}`));
  return <StyledCell>{value}</StyledCell>;
};

// H. 1 heavy derived atom (12 sources — simulates real-world computed cell state)
const CellH_HeavyDerived = ({
  recordId,
  fieldName,
  row,
  col,
}: {
  recordId: string;
  fieldName: string;
  row: number;
  col: number;
}) => {
  const { value } = useAtomValue(
    cellHeavyComputedFamily({ recordId, fieldName, row, col }),
  );
  return <StyledCell>{value}</StyledCell>;
};

// H2. 12 individual atom reads per cell (same sources as H but read separately)
const CellH2_TwelveAtoms = ({
  recordId,
  fieldName,
  row,
  col,
}: {
  recordId: string;
  fieldName: string;
  row: number;
  col: number;
}) => {
  const value = useAtomValue(fieldValueSelectorFamily({ recordId, fieldName }));
  useAtomValue(rowSelectedFamily(recordId));
  useAtomValue(cellIsHoveredFamily({ row, col }));
  useAtomValue(rowFocusedFamily(recordId));
  useAtomValue(rowActiveFamily(recordId));
  useAtomValue(rowDraggingFamily(recordId));
  useAtomValue(rowPendingFamily(recordId));
  useAtomValue(cellReadOnlyFamily(`${recordId}-${fieldName}`));
  useAtomValue(cellForbiddenFamily(`${recordId}-${fieldName}`));
  useAtomValue(cellInputOnlyFamily(`${recordId}-${fieldName}`));
  useAtomValue(objectMetadataItemsAtom);
  useAtomValue(hoverPositionAtom);
  return <StyledCell>{value}</StyledCell>;
};

// I. Context reads + Jotai atoms (real pattern: ctx for position, atoms for data)
const CellI_CtxPlusAtoms = () => {
  const { recordId } = useContext(RowContext);
  const { fieldName, column } = useContext(CellContext);
  const value = useAtomValue(fieldValueSelectorFamily({ recordId, fieldName }));
  useAtomValue(rowSelectedFamily(recordId));
  return <StyledCell>{value}{column}</StyledCell>;
};

// J. New context value per cell (unstable reference — forces child re-renders)
const UnstableCtxInner = () => {
  const value = useContext(FieldValueContext);
  return <StyledCell>{value}</StyledCell>;
};

// K. Stable context with memo child
const MemoStyledCell = memo(({ value }: { value: string }) => (
  <StyledCell>{value}</StyledCell>
));
MemoStyledCell.displayName = 'MemoStyledCell';

const StableCtxInner = () => {
  const value = useContext(FieldValueContext);
  return <MemoStyledCell value={value} />;
};

// L. Per-row provider wrapping per-cell providers (real hierarchy pattern)
const CellL_NestedProviders = () => {
  const { recordId } = useContext(RowContext);
  const { fieldName } = useContext(CellContext);
  const value = useAtomValue(fieldValueSelectorFamily({ recordId, fieldName }));
  return <StyledCell>{value}</StyledCell>;
};

// ---------------------------------------------------------------------------
// Benchmark definitions
// ---------------------------------------------------------------------------

const FIELD_NAMES = [
  'name', 'email', 'phone', 'company', 'city',
  'role', 'status', 'score', 'department', 'manager',
];

type BenchmarkDef = {
  name: string;
  render: (recordIds: string[]) => React.ReactNode;
};

const BENCHMARKS: BenchmarkDef[] = [
  {
    name: 'A. Props only (baseline)',
    render: (recordIds) => (
      <div style={gridCss}>
        {recordIds.flatMap((id, ri) =>
          FIELD_NAMES.map((fn, ci) => (
            <CellA_Props key={`${ri}-${ci}`} value={`${id}-${fn}`} />
          )),
        )}
      </div>
    ),
  },
  {
    name: 'B. 1 context read',
    render: (recordIds) => (
      <div style={gridCss}>
        {recordIds.flatMap((id, ri) =>
          FIELD_NAMES.map((_, ci) => (
            <RowContext.Provider key={`${ri}-${ci}`} value={{ recordId: id, rowIndex: ri }}>
              <CellB_OneCtx />
            </RowContext.Provider>
          )),
        )}
      </div>
    ),
  },
  {
    name: 'C. 2 context reads',
    render: (recordIds) => (
      <div style={gridCss}>
        {recordIds.flatMap((id, ri) =>
          FIELD_NAMES.map((fn, ci) => (
            <RowContext.Provider key={`${ri}-${ci}`} value={{ recordId: id, rowIndex: ri }}>
              <CellContext.Provider value={{ column: ci, fieldName: fn }}>
                <CellC_TwoCtx />
              </CellContext.Provider>
            </RowContext.Provider>
          )),
        )}
      </div>
    ),
  },
  {
    name: 'D. Pre-resolved context (optimal)',
    render: (recordIds) => (
      <div style={gridCss}>
        {recordIds.flatMap((id, ri) =>
          FIELD_NAMES.map((fn, ci) => (
            <FieldValueContext.Provider key={`${ri}-${ci}`} value={`${id}-${fn}`}>
              <CellD_PreResolved />
            </FieldValueContext.Provider>
          )),
        )}
      </div>
    ),
  },
  {
    name: 'E. 1 Jotai selector/cell',
    render: (recordIds) => (
      <Provider store={perfStore}>
        <div style={gridCss}>
          {recordIds.flatMap((id, ri) =>
            FIELD_NAMES.map((fn, ci) => (
              <CellE_OneSelector key={`${ri}-${ci}`} recordId={id} fieldName={fn} />
            )),
          )}
        </div>
      </Provider>
    ),
  },
  {
    name: 'F. 3 Jotai atoms/cell',
    render: (recordIds) => (
      <Provider store={perfStore}>
        <div style={gridCss}>
          {recordIds.flatMap((id, ri) =>
            FIELD_NAMES.map((fn, ci) => (
              <CellF_ThreeAtoms
                key={`${ri}-${ci}`}
                recordId={id}
                fieldName={fn}
                row={ri}
                col={ci}
              />
            )),
          )}
        </div>
      </Provider>
    ),
  },
  {
    name: 'G. 8 Jotai atoms/cell',
    render: (recordIds) => (
      <Provider store={perfStore}>
        <div style={gridCss}>
          {recordIds.flatMap((id, ri) =>
            FIELD_NAMES.map((fn, ci) => (
              <CellG_EightAtoms
                key={`${ri}-${ci}`}
                recordId={id}
                fieldName={fn}
                row={ri}
                col={ci}
              />
            )),
          )}
        </div>
      </Provider>
    ),
  },
  {
    name: 'H. 1 derived atom (12 sources)',
    render: (recordIds) => (
      <Provider store={perfStore}>
        <div style={gridCss}>
          {recordIds.flatMap((id, ri) =>
            FIELD_NAMES.map((fn, ci) => (
              <CellH_HeavyDerived
                key={`${ri}-${ci}`}
                recordId={id}
                fieldName={fn}
                row={ri}
                col={ci}
              />
            )),
          )}
        </div>
      </Provider>
    ),
  },
  {
    name: 'H2. 12 individual atom reads/cell',
    render: (recordIds) => (
      <Provider store={perfStore}>
        <div style={gridCss}>
          {recordIds.flatMap((id, ri) =>
            FIELD_NAMES.map((fn, ci) => (
              <CellH2_TwelveAtoms
                key={`${ri}-${ci}`}
                recordId={id}
                fieldName={fn}
                row={ri}
                col={ci}
              />
            )),
          )}
        </div>
      </Provider>
    ),
  },
  {
    name: 'I. 2 ctx + 2 atoms (real pattern)',
    render: (recordIds) => (
      <Provider store={perfStore}>
        <div style={gridCss}>
          {recordIds.flatMap((id, ri) =>
            FIELD_NAMES.map((fn, ci) => (
              <RowContext.Provider key={`${ri}-${ci}`} value={{ recordId: id, rowIndex: ri }}>
                <CellContext.Provider value={{ column: ci, fieldName: fn }}>
                  <CellI_CtxPlusAtoms />
                </CellContext.Provider>
              </RowContext.Provider>
            )),
          )}
        </div>
      </Provider>
    ),
  },
  {
    name: 'J. Unstable ctx value per cell',
    render: (recordIds) => (
      <div style={gridCss}>
        {recordIds.flatMap((id, ri) =>
          FIELD_NAMES.map((fn, ci) => (
            <FieldValueContext.Provider key={`${ri}-${ci}`} value={`${id}-${fn}`}>
              <UnstableCtxInner />
            </FieldValueContext.Provider>
          )),
        )}
      </div>
    ),
  },
  {
    name: 'K. Stable ctx + React.memo child',
    render: (recordIds) => (
      <div style={gridCss}>
        {recordIds.flatMap((id, ri) =>
          FIELD_NAMES.map((fn, ci) => (
            <FieldValueContext.Provider key={`${ri}-${ci}`} value={`${id}-${fn}`}>
              <StableCtxInner />
            </FieldValueContext.Provider>
          )),
        )}
      </div>
    ),
  },
  {
    name: 'L. Row provider → cell provider → atom (real hierarchy)',
    render: (recordIds) => (
      <Provider store={perfStore}>
        <div style={gridCss}>
          {recordIds.map((id, ri) => (
            <PerRowProvider key={ri} recordId={id} rowIndex={ri}>
              {FIELD_NAMES.map((fn, ci) => (
                <PerCellProvider key={ci} column={ci} fieldName={fn}>
                  <CellL_NestedProviders />
                </PerCellProvider>
              ))}
            </PerRowProvider>
          ))}
        </div>
      </Provider>
    ),
  },
];

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

type BenchmarkResult = {
  name: string;
  times: number[];
  avg: number;
  min: number;
  max: number;
};

const generateRecordIds = () =>
  Array.from({ length: ROWS }, (_, i) => `rec-${i}`);

export const RecordTableStateAccessAudit = () => {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testGrid, setTestGrid] = useState<React.ReactNode | null>(null);
  const [running, setRunning] = useState(false);
  const iterationRef = useRef(0);
  const timesRef = useRef<number[]>([]);
  const startTimeRef = useRef(0);
  const currentBenchRef = useRef<BenchmarkDef | null>(null);
  const queueRef = useRef<BenchmarkDef[]>([]);
  const recordIdsRef = useRef(generateRecordIds());

  const runSingleIteration = useCallback((bench: BenchmarkDef) => {
    setActiveTest(`${bench.name} (${iterationRef.current + 1}/${ITERATIONS})`);
    startTimeRef.current = performance.now();
    setTestGrid(bench.render(recordIdsRef.current));
  }, []);

  useEffect(() => {
    if (!activeTest || startTimeRef.current === 0) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const elapsed = performance.now() - startTimeRef.current;
        startTimeRef.current = 0;
        timesRef.current.push(elapsed);
        iterationRef.current += 1;

        if (iterationRef.current < ITERATIONS && currentBenchRef.current) {
          setTestGrid(null);
          setTimeout(() => runSingleIteration(currentBenchRef.current!), 50);
        } else {
          const times = [...timesRef.current];
          const avg = times.reduce((a, b) => a + b, 0) / times.length;
          const min = Math.min(...times);
          const max = Math.max(...times);

          const benchName = currentBenchRef.current?.name ?? 'unknown';

          setResults((prev) => [
            ...prev,
            { name: benchName, times, avg, min, max },
          ]);

          setTestGrid(null);
          setActiveTest(null);
          currentBenchRef.current = null;

          if (queueRef.current.length > 0) {
            const next = queueRef.current.shift()!;
            setTimeout(() => startBenchmark(next), 100);
          } else {
            setRunning(false);
          }
        }
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTest, testGrid]);

  const startBenchmark = useCallback((bench: BenchmarkDef) => {
    currentBenchRef.current = bench;
    iterationRef.current = 0;
    timesRef.current = [];
    runSingleIteration(bench);
  }, [runSingleIteration]);

  const runAll = useCallback(() => {
    setResults([]);
    setRunning(true);
    queueRef.current = [...BENCHMARKS.slice(1)];
    startBenchmark(BENCHMARKS[0]);
  }, [startBenchmark]);

  const runOne = useCallback(
    (bench: BenchmarkDef) => {
      setRunning(true);
      queueRef.current = [];
      startBenchmark(bench);
    },
    [startBenchmark],
  );

  const perCell = (ms: number) => (ms / TOTAL_CELLS).toFixed(3);
  const overhead = (avg: number) => {
    if (results.length === 0) return '';
    const baseline = results[0].avg;
    const delta = avg - baseline;
    const pct = ((delta / baseline) * 100).toFixed(0);
    return `+${delta.toFixed(1)}ms (+${pct}%)`;
  };

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginBottom: 4 }}>State Access Pattern Audit</h2>
      <p style={{ color: '#666', marginTop: 0 }}>
        <strong>{TOTAL_CELLS.toLocaleString()} cells</strong> ({ROWS} rows x {COLS} cols),
        {ITERATIONS} iterations each. Avg = total mount time.
        Per cell = avg / {TOTAL_CELLS.toLocaleString()}.
      </p>

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={runAll}
          disabled={running}
          style={{
            padding: '8px 16px',
            fontWeight: 'bold',
            fontSize: 14,
            background: running ? '#ccc' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: running ? 'default' : 'pointer',
            marginRight: 8,
          }}
        >
          {running ? `Running: ${activeTest ?? '...'}` : 'Run All Benchmarks'}
        </button>
        <button
          onClick={() => setResults([])}
          disabled={running}
          style={{ padding: '8px 12px', fontSize: 13 }}
        >
          Clear
        </button>
      </div>

      <details style={{ marginBottom: 16 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          Run individual tests
        </summary>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
          {BENCHMARKS.map((bench) => (
            <button
              key={bench.name}
              onClick={() => runOne(bench)}
              disabled={running}
              style={{ fontSize: 11, padding: '4px 8px' }}
            >
              {bench.name}
            </button>
          ))}
        </div>
      </details>

      {results.length > 0 && (
        <div
          style={{
            marginBottom: 16,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            overflow: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f0f7ff' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Test</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>Avg</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>Min</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>Max</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>Avg/cell</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>vs baseline</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', width: 200 }}>Bar</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => {
                const maxAvg = Math.max(...results.map((x) => x.avg));
                const barPct = (r.avg / maxAvg) * 100;
                const isBaseline = i === 0;
                return (
                  <tr
                    key={r.name}
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      background: isBaseline ? '#eff6ff' : undefined,
                    }}
                  >
                    <td style={{ padding: '6px 12px', fontWeight: isBaseline ? 600 : 400 }}>
                      {r.name}
                    </td>
                    <td style={{ textAlign: 'right', padding: '6px 12px', fontWeight: 600 }}>
                      {r.avg.toFixed(1)}ms
                    </td>
                    <td style={{ textAlign: 'right', padding: '6px 12px', color: '#666' }}>
                      {r.min.toFixed(1)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '6px 12px', color: '#666' }}>
                      {r.max.toFixed(1)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '6px 12px', color: '#666' }}>
                      {perCell(r.avg)}ms
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        padding: '6px 12px',
                        color: isBaseline ? '#666' : '#dc2626',
                        fontWeight: isBaseline ? 400 : 500,
                      }}
                    >
                      {isBaseline ? '—' : overhead(r.avg)}
                    </td>
                    <td style={{ padding: '6px 12px' }}>
                      <div
                        style={{
                          height: 16,
                          width: `${barPct}%`,
                          background: isBaseline
                            ? '#93c5fd'
                            : barPct > 80
                              ? '#fca5a5'
                              : barPct > 50
                                ? '#fcd34d'
                                : '#86efac',
                          borderRadius: 2,
                          transition: 'width 0.3s',
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTest && !results.length && (
        <p style={{ color: '#666' }}>Running: {activeTest}...</p>
      )}

      <div style={{ position: 'absolute', left: -9999, top: -9999, visibility: 'hidden' }}>
        {testGrid}
      </div>
    </div>
  );
};
