import { atom, createStore, Provider, useAtomValue } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const ROWS = 50;
const COLS = 8;
const TOTAL_CELLS = ROWS * COLS;

const containerStyle: React.CSSProperties = {
  padding: 16,
  fontFamily: 'sans-serif',
};

const resultsStyle: React.CSSProperties = {
  marginBottom: 16,
  padding: 12,
  background: '#f0f7ff',
  borderRadius: 4,
  fontSize: 13,
  lineHeight: 1.6,
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(${COLS}, 150px)`,
  gap: 0,
};

const cellStyle: React.CSSProperties = {
  height: 32,
  borderBottom: '1px solid #eee',
  borderRight: '1px solid #eee',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  fontSize: 13,
};

const store = createStore();

const recordAtomFamily = atomFamily((recordId: string) =>
  atom<Record<string, string>>({
    name: `Record ${recordId}`,
    email: `${recordId}@test.com`,
    phone: '555-0100',
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

const RowContext = createContext({ recordId: '', rowIndex: 0 });
const CellContext = createContext({ column: 0, fieldName: '' });
const FieldValueContext = createContext('');

const CellNoState = ({ value }: { value: string }) => (
  <div style={cellStyle}>{value}</div>
);

const CellOneContext = () => {
  const { recordId } = useContext(RowContext);
  return <div style={cellStyle}>{recordId}</div>;
};

const CellTwoContexts = () => {
  const { recordId } = useContext(RowContext);
  const { fieldName } = useContext(CellContext);
  return (
    <div style={cellStyle}>
      {recordId}-{fieldName}
    </div>
  );
};

const CellOneAtom = ({
  recordId,
  fieldName,
}: {
  recordId: string;
  fieldName: string;
}) => {
  const value = useAtomValue(
    fieldValueSelectorFamily({ recordId, fieldName }),
  );
  return <div style={cellStyle}>{value}</div>;
};

const CellThreeAtoms = ({
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
  const value = useAtomValue(
    fieldValueSelectorFamily({ recordId, fieldName }),
  );
  useAtomValue(rowSelectedFamily(recordId));
  useAtomValue(cellIsHoveredFamily({ row, col }));
  return <div style={cellStyle}>{value}</div>;
};

const CellContextPlusAtom = () => {
  const { recordId } = useContext(RowContext);
  const { fieldName } = useContext(CellContext);
  const value = useAtomValue(
    fieldValueSelectorFamily({ recordId, fieldName }),
  );
  return <div style={cellStyle}>{value}</div>;
};

const CellPreResolvedContext = () => {
  const value = useContext(FieldValueContext);
  return <div style={cellStyle}>{value}</div>;
};

type BenchmarkResult = { name: string; renderTimeMs: number };

const generateRecordIds = () =>
  Array.from({ length: ROWS }, (_, i) => `rec-${i}`);

const FIELD_NAMES = [
  'name',
  'email',
  'phone',
  'name',
  'email',
  'phone',
  'name',
  'email',
];

export const RecordTableStateAccessAudit = () => {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testGrid, setTestGrid] = useState<React.ReactNode | null>(null);
  const startTimeRef = useRef(0);
  const recordIds = useRef(generateRecordIds());

  const runBenchmark = (name: string, renderGrid: () => React.ReactNode) => {
    setActiveTest(name);
    startTimeRef.current = performance.now();
    setTestGrid(renderGrid());
  };

  useEffect(() => {
    if (activeTest && startTimeRef.current > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const elapsed = performance.now() - startTimeRef.current;
          setResults((prev) => [
            ...prev,
            { name: activeTest, renderTimeMs: elapsed },
          ]);
          setActiveTest(null);
          startTimeRef.current = 0;
        });
      });
    }
  }, [activeTest, testGrid]);

  const perCell = (ms: number) => (ms / TOTAL_CELLS).toFixed(3);

  const gridA = () => (
    <div style={gridStyle}>
      {recordIds.current.flatMap((id, row) =>
        FIELD_NAMES.map((_, col) => (
          <CellNoState key={`${row}-${col}`} value={`${id}-col${col}`} />
        )),
      )}
    </div>
  );

  const gridB = () => (
    <div style={gridStyle}>
      {recordIds.current.flatMap((id, row) =>
        FIELD_NAMES.map((_, col) => (
          <RowContext.Provider
            key={`${row}-${col}`}
            value={{ recordId: id, rowIndex: row }}
          >
            <CellOneContext />
          </RowContext.Provider>
        )),
      )}
    </div>
  );

  const gridC = () => (
    <div style={gridStyle}>
      {recordIds.current.flatMap((id, row) =>
        FIELD_NAMES.map((fieldName, col) => (
          <RowContext.Provider
            key={`${row}-${col}`}
            value={{ recordId: id, rowIndex: row }}
          >
            <CellContext.Provider value={{ column: col, fieldName }}>
              <CellTwoContexts />
            </CellContext.Provider>
          </RowContext.Provider>
        )),
      )}
    </div>
  );

  const gridD = () => (
    <Provider store={store}>
      <div style={gridStyle}>
        {recordIds.current.flatMap((id, row) =>
          FIELD_NAMES.map((fieldName, col) => (
            <CellOneAtom
              key={`${row}-${col}`}
              recordId={id}
              fieldName={fieldName}
            />
          )),
        )}
      </div>
    </Provider>
  );

  const gridE = () => (
    <Provider store={store}>
      <div style={gridStyle}>
        {recordIds.current.flatMap((id, row) =>
          FIELD_NAMES.map((fieldName, col) => (
            <CellThreeAtoms
              key={`${row}-${col}`}
              recordId={id}
              fieldName={fieldName}
              row={row}
              col={col}
            />
          )),
        )}
      </div>
    </Provider>
  );

  const gridF = () => (
    <Provider store={store}>
      <div style={gridStyle}>
        {recordIds.current.flatMap((id, row) =>
          FIELD_NAMES.map((fieldName, col) => (
            <RowContext.Provider
              key={`${row}-${col}`}
              value={{ recordId: id, rowIndex: row }}
            >
              <CellContext.Provider value={{ column: col, fieldName }}>
                <CellContextPlusAtom />
              </CellContext.Provider>
            </RowContext.Provider>
          )),
        )}
      </div>
    </Provider>
  );

  const gridG = () => (
    <div style={gridStyle}>
      {recordIds.current.flatMap((id, row) =>
        FIELD_NAMES.map((fieldName, col) => (
          <FieldValueContext.Provider
            key={`${row}-${col}`}
            value={`${id}-${fieldName}`}
          >
            <CellPreResolvedContext />
          </FieldValueContext.Provider>
        )),
      )}
    </div>
  );

  return (
    <div style={containerStyle}>
      <h3>State Access Pattern Audit</h3>
      <p>
        Comparing state access overhead for {TOTAL_CELLS} cells ({ROWS}r x{' '}
        {COLS}c).
      </p>

      <div
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}
      >
        <button onClick={() => runBenchmark('A. No state (baseline)', gridA)}>
          A. No state
        </button>
        <button onClick={() => runBenchmark('B. 1 context', gridB)}>
          B. 1 context
        </button>
        <button onClick={() => runBenchmark('C. 2 contexts', gridC)}>
          C. 2 contexts
        </button>
        <button onClick={() => runBenchmark('D. 1 Jotai atom', gridD)}>
          D. 1 atom
        </button>
        <button onClick={() => runBenchmark('E. 3 Jotai atoms', gridE)}>
          E. 3 atoms
        </button>
        <button onClick={() => runBenchmark('F. Context + atom', gridF)}>
          F. Ctx + atom
        </button>
        <button onClick={() => runBenchmark('G. Pre-resolved ctx', gridG)}>
          G. Pre-resolved
        </button>
      </div>

      {results.length > 0 && (
        <div style={resultsStyle}>
          <strong>Results ({TOTAL_CELLS} cells):</strong>
          <br />
          {results.map((r, i) => (
            <div key={i}>
              {r.name}: <strong>{r.renderTimeMs.toFixed(1)}ms</strong> total (
              {perCell(r.renderTimeMs)}ms/cell)
            </div>
          ))}
        </div>
      )}

      {activeTest && <p>Running: {activeTest}...</p>}
      {testGrid}
    </div>
  );
};
