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
  background: '#f5f5f5',
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

const MinimalCell = ({ value }: { value: string }) => (
  <div style={cellStyle}>{value}</div>
);

const CellWithUseState = ({ value }: { value: string }) => {
  const [_isFocused, _setIsFocused] = useState(false);
  return <div style={cellStyle}>{value}</div>;
};

const FakeRowContext = createContext({
  recordId: '',
  rowIndex: 0,
  isSelected: false,
});

const FakeCellContext = createContext({
  column: 0,
  row: 0,
});

const FakeFieldContext = createContext({
  fieldName: '',
  isReadOnly: false,
});

const CellWith3Contexts = ({ value }: { value: string }) => {
  useContext(FakeRowContext);
  useContext(FakeCellContext);
  useContext(FakeFieldContext);
  return <div style={cellStyle}>{value}</div>;
};

const CellWith3ContextsAndHooks = ({ value }: { value: string }) => {
  useContext(FakeRowContext);
  useContext(FakeCellContext);
  const { isReadOnly } = useContext(FakeFieldContext);
  const [_isFocused, setIsFocused] = useState(false);

  const handleMouseMove = () => {
    setIsFocused(true);
  };
  const handleMouseLeave = () => {
    setIsFocused(false);
  };
  const handleClick = () => {};

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ ...cellStyle, cursor: isReadOnly ? 'default' : 'pointer' }}
    >
      {value}
    </div>
  );
};

const Wrapper1 = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
const Wrapper2 = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
const Wrapper3 = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
const Wrapper4 = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
const Wrapper5 = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
const Wrapper6 = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
const Wrapper7 = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
const Wrapper8 = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const DeeplyNestedCell = ({ value }: { value: string }) => (
  <Wrapper1>
    <Wrapper2>
      <Wrapper3>
        <Wrapper4>
          <Wrapper5>
            <Wrapper6>
              <Wrapper7>
                <Wrapper8>
                  <div style={cellStyle}>{value}</div>
                </Wrapper8>
              </Wrapper7>
            </Wrapper6>
          </Wrapper5>
        </Wrapper4>
      </Wrapper3>
    </Wrapper2>
  </Wrapper1>
);

const ContextProvider1 = ({ children }: { children: React.ReactNode }) => (
  <FakeRowContext.Provider
    value={{ recordId: 'rec-1', rowIndex: 0, isSelected: false }}
  >
    {children}
  </FakeRowContext.Provider>
);
const ContextProvider2 = ({ children }: { children: React.ReactNode }) => (
  <FakeCellContext.Provider value={{ column: 0, row: 0 }}>
    {children}
  </FakeCellContext.Provider>
);
const ContextProvider3 = ({ children }: { children: React.ReactNode }) => (
  <FakeFieldContext.Provider value={{ fieldName: 'name', isReadOnly: false }}>
    {children}
  </FakeFieldContext.Provider>
);

const FullSimulationCell = ({ value }: { value: string }) => (
  <ContextProvider1>
    <ContextProvider2>
      <ContextProvider3>
        <Wrapper1>
          <Wrapper2>
            <Wrapper3>
              <CellWith3ContextsAndHooks value={value} />
            </Wrapper3>
          </Wrapper2>
        </Wrapper1>
      </ContextProvider3>
    </ContextProvider2>
  </ContextProvider1>
);

const cellOuterStyle: React.CSSProperties = {
  borderBottom: '1px solid #eee',
  borderRight: '1px solid #eee',
  padding: 0,
  textAlign: 'left',
  background: 'white',
};
const cellBaseStyle: React.CSSProperties = {
  alignItems: 'center',
  boxSizing: 'border-box',
  cursor: 'pointer',
  display: 'flex',
  height: 32,
  userSelect: 'none',
  position: 'relative',
};
const cellDisplayOuterStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
  paddingLeft: 8,
  width: '100%',
};
const cellDisplayInnerStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
  width: '100%',
  whiteSpace: 'nowrap',
};

const MultiStyledCell = ({ value }: { value: string }) => (
  <div style={cellOuterStyle}>
    <div style={cellBaseStyle}>
      <div style={cellDisplayOuterStyle}>
        <div style={cellDisplayInnerStyle}>{value}</div>
      </div>
    </div>
  </div>
);

type BenchmarkResult = {
  name: string;
  renderTimeMs: number;
};

const generateData = () =>
  Array.from({ length: ROWS }, (_, row) =>
    Array.from(
      { length: COLS },
      (_, col) => `Cell ${row}-${col} sample text`,
    ),
  );

export const RecordTableCellPerformanceAudit = () => {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testGrid, setTestGrid] = useState<React.ReactNode | null>(null);
  const startTimeRef = useRef(0);
  const data = useRef(generateData());

  const runBenchmark = (
    name: string,
    CellComponent: React.ComponentType<{ value: string }>,
  ) => {
    setActiveTest(name);
    startTimeRef.current = performance.now();

    const grid = (
      <div style={gridStyle}>
        {data.current.flatMap((row, rowIndex) =>
          row.map((value, colIndex) => (
            <CellComponent key={`${rowIndex}-${colIndex}`} value={value} />
          )),
        )}
      </div>
    );

    setTestGrid(grid);
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

  return (
    <div style={containerStyle}>
      <h3>RecordTable Cell Performance Audit</h3>
      <p>
        Rendering {TOTAL_CELLS} cells ({ROWS} rows x {COLS} cols). Click each
        to measure.
      </p>

      <div
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}
      >
        <button onClick={() => runBenchmark('1. Minimal div', MinimalCell)}>
          1. Minimal div
        </button>
        <button
          onClick={() => runBenchmark('2. + useState', CellWithUseState)}
        >
          2. + useState
        </button>
        <button
          onClick={() => runBenchmark('3. + 3 contexts', CellWith3Contexts)}
        >
          3. + 3 contexts
        </button>
        <button
          onClick={() =>
            runBenchmark(
              '4. + 3 contexts + hooks',
              CellWith3ContextsAndHooks,
            )
          }
        >
          4. + 3 contexts + hooks
        </button>
        <button
          onClick={() =>
            runBenchmark('5. + 8 wrapper depth', DeeplyNestedCell)
          }
        >
          5. + 8 wrapper depth
        </button>
        <button
          onClick={() =>
            runBenchmark(
              '6. Full simulation (nesting+ctx+hooks)',
              FullSimulationCell,
            )
          }
        >
          6. Full simulation
        </button>
        <button
          onClick={() =>
            runBenchmark('7. 4 styled divs per cell', MultiStyledCell)
          }
        >
          7. 4 styled divs
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
          {results.length >= 2 && (
            <div
              style={{
                marginTop: 8,
                borderTop: '1px solid #ddd',
                paddingTop: 8,
              }}
            >
              <strong>Overhead vs minimal:</strong>
              <br />
              {results.slice(1).map((r, i) => {
                const baseline = results[0].renderTimeMs;
                const overhead = r.renderTimeMs - baseline;
                const pct = ((overhead / baseline) * 100).toFixed(0);
                return (
                  <div key={i}>
                    {r.name}: +{overhead.toFixed(1)}ms (+{pct}%) = +
                    {((overhead / TOTAL_CELLS) * 1000).toFixed(0)}us/cell
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTest && <p>Running: {activeTest}...</p>}
      {testGrid}
    </div>
  );
};
