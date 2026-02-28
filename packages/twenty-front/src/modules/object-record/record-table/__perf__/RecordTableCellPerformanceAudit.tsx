import { useEffect, useRef, useState } from 'react';
import { styled } from '@linaria/react';

// POC: Performance audit comparing minimal cell vs current architecture overhead
// This component renders a grid of cells using different approaches and measures timings.

const ROWS = 50;
const COLS = 8;
const TOTAL_CELLS = ROWS * COLS;

const StyledContainer = styled.div`
  padding: 16px;
  font-family: sans-serif;
`;

const StyledResults = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
`;

const StyledBenchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${COLS}, 150px);
  gap: 0;
`;

const StyledMinimalCell = styled.div`
  height: 32px;
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
  padding: 0 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  font-size: 13px;
`;

// Approach 1: Absolute minimal - just a div with text
const MinimalCell = ({ value }: { value: string }) => (
  <StyledMinimalCell>{value}</StyledMinimalCell>
);

// Approach 2: With useState (simulating FieldFocusContextProvider)
const CellWithUseState = ({ value }: { value: string }) => {
  const [_isFocused, _setIsFocused] = useState(false);
  return <StyledMinimalCell>{value}</StyledMinimalCell>;
};

// Approach 3: With context consumption (simulating real cell)
import { createContext, useContext } from 'react';

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
  return <StyledMinimalCell>{value}</StyledMinimalCell>;
};

// Approach 4: With 3 contexts + useState + 2 function creations (simulating hooks)
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
    <StyledMinimalCell
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ cursor: isReadOnly ? 'default' : 'pointer' }}
    >
      {value}
    </StyledMinimalCell>
  );
};

// Approach 5: Deep component nesting (simulating current ~15 component depth)
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
                  <StyledMinimalCell>{value}</StyledMinimalCell>
                </Wrapper8>
              </Wrapper7>
            </Wrapper6>
          </Wrapper5>
        </Wrapper4>
      </Wrapper3>
    </Wrapper2>
  </Wrapper1>
);

// Approach 6: Deep nesting + contexts + hooks (closest to current architecture)
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

// Approach 7: Multiple styled components per cell (simulating StyledCell + StyledBaseContainer + StyledOuterContainer + StyledInnerContainer)
const StyledCellOuter = styled.div`
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
  padding: 0;
  text-align: left;
  background: white;
`;

const StyledCellBase = styled.div`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  user-select: none;
  position: relative;
`;

const StyledCellDisplayOuter = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  padding-left: 8px;
  width: 100%;
`;

const StyledCellDisplayInner = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
`;

const MultiStyledCell = ({ value }: { value: string }) => (
  <StyledCellOuter>
    <StyledCellBase>
      <StyledCellDisplayOuter>
        <StyledCellDisplayInner>{value}</StyledCellDisplayInner>
      </StyledCellDisplayOuter>
    </StyledCellBase>
  </StyledCellOuter>
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
      <StyledBenchGrid>
        {data.current.flatMap((row, rowIndex) =>
          row.map((value, colIndex) => (
            <CellComponent
              key={`${rowIndex}-${colIndex}`}
              value={value}
            />
          )),
        )}
      </StyledBenchGrid>
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
    <StyledContainer>
      <h3>RecordTable Cell Performance Audit</h3>
      <p>
        Rendering {TOTAL_CELLS} cells ({ROWS} rows x {COLS} cols). Click each
        to measure.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button onClick={() => runBenchmark('1. Minimal div', MinimalCell)}>
          1. Minimal div
        </button>
        <button
          onClick={() => runBenchmark('2. + useState', CellWithUseState)}
        >
          2. + useState
        </button>
        <button
          onClick={() =>
            runBenchmark('3. + 3 contexts', CellWith3Contexts)
          }
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
        <StyledResults>
          <strong>Results ({TOTAL_CELLS} cells):</strong>
          <br />
          {results.map((r, i) => (
            <div key={i}>
              {r.name}: <strong>{r.renderTimeMs.toFixed(1)}ms</strong> total (
              {perCell(r.renderTimeMs)}ms/cell)
            </div>
          ))}
          {results.length >= 2 && (
            <div style={{ marginTop: 8, borderTop: '1px solid #ddd', paddingTop: 8 }}>
              <strong>Overhead vs minimal:</strong>
              <br />
              {results.slice(1).map((r, i) => {
                const baseline = results[0].renderTimeMs;
                const overhead = r.renderTimeMs - baseline;
                const pct = ((overhead / baseline) * 100).toFixed(0);
                return (
                  <div key={i}>
                    {r.name}: +{overhead.toFixed(1)}ms (+{pct}%) = +
                    {(overhead / TOTAL_CELLS * 1000).toFixed(0)}μs/cell
                  </div>
                );
              })}
            </div>
          )}
        </StyledResults>
      )}

      {activeTest && <p>Running: {activeTest}...</p>}
      {testGrid}
    </StyledContainer>
  );
};
