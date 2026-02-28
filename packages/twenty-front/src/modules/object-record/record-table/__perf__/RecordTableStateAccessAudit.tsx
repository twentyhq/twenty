import { atom, createStore, Provider, useAtomValue } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { styled } from '@linaria/react';

// POC: Measures overhead of different state access patterns
// Compares: raw context, single atom, multiple atoms, atom families, selectors

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
  background: #f0f7ff;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${COLS}, 150px);
  gap: 0;
`;

const StyledCell = styled.div`
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

// Store for atom-based tests
const store = createStore();

// Atom families simulating recordStoreFamilyState
const recordAtomFamily = atomFamily((recordId: string) =>
  atom<Record<string, string>>({
    name: `Record ${recordId}`,
    email: `${recordId}@test.com`,
    phone: '555-0100',
  }),
);

// Field value selector (like recordStoreFieldValueSelector)
const fieldValueSelectorFamily = atomFamily(
  ({ recordId, fieldName }: { recordId: string; fieldName: string }) =>
    atom((get) => get(recordAtomFamily(recordId))?.[fieldName] ?? ''),
  (a, b) => a.recordId === b.recordId && a.fieldName === b.fieldName,
);

// Row selection state (like isRowSelectedComponentFamilyState)
const rowSelectedFamily = atomFamily((_recordId: string) => atom(false));

// Hover position atom (table-wide, like recordTableHoverPositionComponentState)
const hoverPositionAtom = atom<{ row: number; col: number } | null>(null);

// Focus position atom
const focusPositionAtom = atom<{ row: number; col: number } | null>(null);

// Combined selector that checks if this cell is hovered
const cellIsHoveredFamily = atomFamily(
  ({ row, col }: { row: number; col: number }) =>
    atom((get) => {
      const pos = get(hoverPositionAtom);
      return pos !== null && pos.row === row && pos.col === col;
    }),
  (a, b) => a.row === b.row && a.col === b.col,
);

// Context approach
const RowContext = createContext({ recordId: '', rowIndex: 0 });
const CellContext = createContext({ column: 0, fieldName: '' });
const FieldValueContext = createContext('');

// --- Test cells ---

// A: No state at all (baseline)
const CellNoState = ({ value }: { value: string }) => (
  <StyledCell>{value}</StyledCell>
);

// B: One context read
const CellOneContext = () => {
  const { recordId } = useContext(RowContext);
  return <StyledCell>{recordId}</StyledCell>;
};

// C: Two context reads
const CellTwoContexts = () => {
  const { recordId } = useContext(RowContext);
  const { fieldName } = useContext(CellContext);
  return (
    <StyledCell>
      {recordId}-{fieldName}
    </StyledCell>
  );
};

// D: One Jotai atom read (field value selector)
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
  return <StyledCell>{value}</StyledCell>;
};

// E: Three Jotai atom reads (simulating current cell: field value + row selected + hover check)
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
  return <StyledCell>{value}</StyledCell>;
};

// F: Context + atom combined (closest to current pattern)
const CellContextPlusAtom = () => {
  const { recordId } = useContext(RowContext);
  const { fieldName } = useContext(CellContext);
  const value = useAtomValue(
    fieldValueSelectorFamily({ recordId, fieldName }),
  );
  return <StyledCell>{value}</StyledCell>;
};

// G: Pre-resolved context value (value passed through context, no atom read)
const CellPreResolvedContext = () => {
  const value = useContext(FieldValueContext);
  return <StyledCell>{value}</StyledCell>;
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
          setResults((prev) => [...prev, { name: activeTest, renderTimeMs: elapsed }]);
          setActiveTest(null);
          startTimeRef.current = 0;
        });
      });
    }
  }, [activeTest, testGrid]);

  const perCell = (ms: number) => (ms / TOTAL_CELLS).toFixed(3);

  const gridA = () => (
    <StyledGrid>
      {recordIds.current.flatMap((id, row) =>
        FIELD_NAMES.map((_, col) => (
          <CellNoState key={`${row}-${col}`} value={`${id}-col${col}`} />
        )),
      )}
    </StyledGrid>
  );

  const gridB = () => (
    <StyledGrid>
      {recordIds.current.flatMap((id, row) =>
        FIELD_NAMES.map((_, col) => (
          <RowContext.Provider key={`${row}-${col}`} value={{ recordId: id, rowIndex: row }}>
            <CellOneContext />
          </RowContext.Provider>
        )),
      )}
    </StyledGrid>
  );

  const gridC = () => (
    <StyledGrid>
      {recordIds.current.flatMap((id, row) =>
        FIELD_NAMES.map((fieldName, col) => (
          <RowContext.Provider key={`${row}-${col}`} value={{ recordId: id, rowIndex: row }}>
            <CellContext.Provider value={{ column: col, fieldName }}>
              <CellTwoContexts />
            </CellContext.Provider>
          </RowContext.Provider>
        )),
      )}
    </StyledGrid>
  );

  const gridD = () => (
    <Provider store={store}>
      <StyledGrid>
        {recordIds.current.flatMap((id, row) =>
          FIELD_NAMES.map((fieldName, col) => (
            <CellOneAtom key={`${row}-${col}`} recordId={id} fieldName={fieldName} />
          )),
        )}
      </StyledGrid>
    </Provider>
  );

  const gridE = () => (
    <Provider store={store}>
      <StyledGrid>
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
      </StyledGrid>
    </Provider>
  );

  const gridF = () => (
    <Provider store={store}>
      <StyledGrid>
        {recordIds.current.flatMap((id, row) =>
          FIELD_NAMES.map((fieldName, col) => (
            <RowContext.Provider key={`${row}-${col}`} value={{ recordId: id, rowIndex: row }}>
              <CellContext.Provider value={{ column: col, fieldName }}>
                <CellContextPlusAtom />
              </CellContext.Provider>
            </RowContext.Provider>
          )),
        )}
      </StyledGrid>
    </Provider>
  );

  const gridG = () => (
    <StyledGrid>
      {recordIds.current.flatMap((id, row) =>
        FIELD_NAMES.map((fieldName, col) => (
          <FieldValueContext.Provider key={`${row}-${col}`} value={`${id}-${fieldName}`}>
            <CellPreResolvedContext />
          </FieldValueContext.Provider>
        )),
      )}
    </StyledGrid>
  );

  return (
    <StyledContainer>
      <h3>State Access Pattern Audit</h3>
      <p>
        Comparing state access overhead for {TOTAL_CELLS} cells ({ROWS}r x{' '}
        {COLS}c).
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
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
        <StyledResults>
          <strong>Results ({TOTAL_CELLS} cells):</strong>
          <br />
          {results.map((r, i) => (
            <div key={i}>
              {r.name}: <strong>{r.renderTimeMs.toFixed(1)}ms</strong> total (
              {perCell(r.renderTimeMs)}ms/cell)
            </div>
          ))}
        </StyledResults>
      )}

      {activeTest && <p>Running: {activeTest}...</p>}
      {testGrid}
    </StyledContainer>
  );
};
