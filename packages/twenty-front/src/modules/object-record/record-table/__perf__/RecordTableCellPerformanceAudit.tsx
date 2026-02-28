import { type Theme, withTheme } from '@emotion/react';
import emotionStyled from '@emotion/styled';
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

import {
  LinariaStaticCell,
  LinariaDynamicCell,
  LinariaOuterWrapper,
  LinariaBaseContainer,
  LinariaDisplayOuter,
  LinariaDisplayInner,
} from './perf-linaria-cells';

const ROWS = 200;
const COLS = 10;
const TOTAL_CELLS = ROWS * COLS;

const ITERATIONS = 3;

// ---------------------------------------------------------------------------
// Shared layout
// ---------------------------------------------------------------------------

const gridCss = {
  display: 'grid',
  gridTemplateColumns: `repeat(${COLS}, 120px)`,
  gap: 0,
} as const;

const cellCss: React.CSSProperties = {
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

// ---------------------------------------------------------------------------
// Emotion styled components (runtime — NOT processed by wyw)
// ---------------------------------------------------------------------------

const EmotionStaticCell = emotionStyled.div`
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

const EmotionDynamicCell = emotionStyled.div<{
  bgColor: string;
  borderColor: string;
  fontColor: string;
  isReadOnly: boolean;
}>`
  height: 32px;
  border-bottom: 1px solid ${({ borderColor }) => borderColor};
  border-right: 1px solid ${({ borderColor }) => borderColor};
  padding: 0 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  font-size: 13px;
  background: ${({ bgColor }) => bgColor};
  color: ${({ fontColor }) => fontColor};
  cursor: ${({ isReadOnly }) => (isReadOnly ? 'default' : 'pointer')};
`;

const EmotionThemeCell = emotionStyled.div`
  height: 32px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 0 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  font-size: 13px;
  background: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.primary};
`;

const EmotionWithThemeCell = withTheme(emotionStyled.div<{ theme: Theme }>`
  height: 32px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 0 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  font-size: 13px;
  background: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.primary};
`);

// ---------------------------------------------------------------------------
// Contexts (simulating the real RecordTable context chain)
// ---------------------------------------------------------------------------

const RowCtx = createContext({
  recordId: '',
  rowIndex: 0,
  isSelected: false,
  isDragging: false,
  isActive: false,
  isFocused: false,
});

const CellCtx = createContext({
  column: 0,
  row: 0,
  fieldMetadataItemId: '',
});

const FieldCtx = createContext({
  fieldName: '',
  isReadOnly: false,
  isLabelIdentifier: false,
  entityId: '',
  fieldDefinition: null as unknown,
});

const TableCtx = createContext({
  objectMetadataItem: null as unknown,
  objectMetadataItems: [] as unknown[],
  objectPermissions: null as unknown,
  visibleTableColumns: [] as unknown[],
});

const FocusCtx = createContext({
  isFocused: false,
  setIsFocused: (() => {}) as (v: boolean) => void,
});

// ---------------------------------------------------------------------------
// Jotai store (simulating real RecordTable atoms)
// ---------------------------------------------------------------------------

const perfStore = createStore();

const recordFieldFamily = atomFamily(
  ({ recordId, fieldName }: { recordId: string; fieldName: string }) =>
    atom(`${recordId}-${fieldName}`),
  (a, b) => a.recordId === b.recordId && a.fieldName === b.fieldName,
);

const rowSelectedFamily = atomFamily((_recordId: string) => atom(false));
const rowFocusedFamily = atomFamily((_recordId: string) => atom(false));
const rowActiveFamily = atomFamily((_recordId: string) => atom(false));
const rowDraggingFamily = atomFamily((_recordId: string) => atom(false));
const rowPendingFamily = atomFamily((_recordId: string) => atom(false));
const cellReadOnlyFamily = atomFamily((_key: string) => atom(false), (a, b) => a === b);
const cellForbiddenFamily = atomFamily((_key: string) => atom(false), (a, b) => a === b);

const hoverPositionAtom = atom<{ row: number; col: number } | null>(null);

const objectMetadataItemsAtom = atom(
  Array.from({ length: 30 }, (_, i) => ({
    id: `obj-${i}`,
    nameSingular: `Object${i}`,
    fields: Array.from({ length: 20 }, (_, j) => ({ id: `f-${i}-${j}`, name: `field${j}` })),
  })),
);

const cellIsHoveredFamily = atomFamily(
  ({ row, col }: { row: number; col: number }) =>
    atom((get) => {
      const pos = get(hoverPositionAtom);
      return pos !== null && pos.row === row && pos.col === col;
    }),
  (a, b) => a.row === b.row && a.col === b.col,
);

// ---------------------------------------------------------------------------
// Cell variants — each adds one more layer of real-world complexity
// ---------------------------------------------------------------------------

const Cell01_InlineStyle = ({ value }: { value: string }) => (
  <div style={cellCss}>{value}</div>
);

const Cell02_LinariaStatic = ({ value }: { value: string }) => (
  <LinariaStaticCell>{value}</LinariaStaticCell>
);

const Cell03_LinariaDynamic = ({ value }: { value: string }) => (
  <LinariaDynamicCell
    bgColor="white"
    borderColor="#eee"
    fontColor="#333"
    isReadOnly={false}
  >
    {value}
  </LinariaDynamicCell>
);

const Cell04_EmotionStatic = ({ value }: { value: string }) => (
  <EmotionStaticCell>{value}</EmotionStaticCell>
);

const Cell05_EmotionDynamic = ({ value }: { value: string }) => (
  <EmotionDynamicCell
    bgColor="white"
    borderColor="#eee"
    fontColor="#333"
    isReadOnly={false}
  >
    {value}
  </EmotionDynamicCell>
);

const Cell06_EmotionTheme = ({ value }: { value: string }) => (
  <EmotionThemeCell>{value}</EmotionThemeCell>
);

const Cell07_EmotionWithTheme = ({ value }: { value: string }) => (
  <EmotionWithThemeCell>{value}</EmotionWithThemeCell>
);

const Cell08_LinariaPlusContexts = ({ value }: { value: string }) => {
  useContext(RowCtx);
  useContext(CellCtx);
  useContext(FieldCtx);
  return (
    <LinariaDynamicCell
      bgColor="white"
      borderColor="#eee"
      fontColor="#333"
      isReadOnly={false}
    >
      {value}
    </LinariaDynamicCell>
  );
};

const Cell09_FiveContexts = ({ value }: { value: string }) => {
  useContext(RowCtx);
  useContext(CellCtx);
  useContext(FieldCtx);
  useContext(TableCtx);
  useContext(FocusCtx);
  return (
    <LinariaDynamicCell
      bgColor="white"
      borderColor="#eee"
      fontColor="#333"
      isReadOnly={false}
    >
      {value}
    </LinariaDynamicCell>
  );
};

const Cell10_WithUseState = ({ value }: { value: string }) => {
  const [_isFocused] = useState(false);
  useContext(RowCtx);
  useContext(CellCtx);
  useContext(FieldCtx);
  return (
    <LinariaDynamicCell
      bgColor="white"
      borderColor="#eee"
      fontColor="#333"
      isReadOnly={false}
    >
      {value}
    </LinariaDynamicCell>
  );
};

const Cell11_TwoUseStates = ({ value }: { value: string }) => {
  const [_isFocused] = useState(false);
  const [_isOverflowing] = useState(false);
  useContext(RowCtx);
  useContext(CellCtx);
  useContext(FieldCtx);
  return (
    <LinariaDynamicCell
      bgColor="white"
      borderColor="#eee"
      fontColor="#333"
      isReadOnly={false}
    >
      {value}
    </LinariaDynamicCell>
  );
};

const Cell12_EventHandlers = ({ value }: { value: string }) => {
  const [_isFocused, setIsFocused] = useState(false);
  useContext(RowCtx);
  useContext(CellCtx);
  useContext(FieldCtx);

  const handleMouseMove = () => setIsFocused(true);
  const handleMouseLeave = () => setIsFocused(false);
  const handleClick = () => {};

  return (
    <LinariaDynamicCell
      bgColor="white"
      borderColor="#eee"
      fontColor="#333"
      isReadOnly={false}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {value}
    </LinariaDynamicCell>
  );
};

// 10 atom reads per cell (real RecordTable reads ~8-12 atoms per cell)
const Cell13_JotaiAtoms = ({
  value,
  recordId,
  fieldName,
  row,
  col,
}: {
  value: string;
  recordId: string;
  fieldName: string;
  row: number;
  col: number;
}) => {
  useAtomValue(recordFieldFamily({ recordId, fieldName }));
  useAtomValue(rowSelectedFamily(recordId));
  useAtomValue(cellIsHoveredFamily({ row, col }));
  useAtomValue(rowFocusedFamily(recordId));
  useAtomValue(rowActiveFamily(recordId));
  useAtomValue(rowDraggingFamily(recordId));
  useAtomValue(rowPendingFamily(recordId));
  useAtomValue(cellReadOnlyFamily(`${recordId}-${fieldName}`));
  useAtomValue(cellForbiddenFamily(`${recordId}-${fieldName}`));
  useAtomValue(objectMetadataItemsAtom);
  useContext(RowCtx);
  useContext(CellCtx);
  useContext(FieldCtx);
  return (
    <LinariaDynamicCell
      bgColor="white"
      borderColor="#eee"
      fontColor="#333"
      isReadOnly={false}
    >
      {value}
    </LinariaDynamicCell>
  );
};

const Cell14_FourLinariaLevels = ({ value }: { value: string }) => {
  useContext(RowCtx);
  useContext(CellCtx);
  useContext(FieldCtx);
  return (
    <LinariaOuterWrapper backgroundColor="white" borderColor="#eee">
      <LinariaBaseContainer
        fontColorMedium="#999"
        bgSecondary="#f5f5f5"
        fontColorSecondary="#666"
        isReadOnly={false}
      >
        <LinariaDisplayOuter>
          <LinariaDisplayInner>{value}</LinariaDisplayInner>
        </LinariaDisplayOuter>
      </LinariaBaseContainer>
    </LinariaOuterWrapper>
  );
};

const FullSimProvider = ({
  children,
  row,
  col,
}: {
  children: React.ReactNode;
  row: number;
  col: number;
}) => (
  <RowCtx.Provider
    value={{
      recordId: `rec-${row}`,
      rowIndex: row,
      isSelected: false,
      isDragging: false,
      isActive: false,
      isFocused: false,
    }}
  >
    <CellCtx.Provider
      value={{ column: col, row, fieldMetadataItemId: `fld-${col}` }}
    >
      <FieldCtx.Provider
        value={{
          fieldName: `field-${col}`,
          isReadOnly: false,
          isLabelIdentifier: col === 0,
          entityId: `rec-${row}`,
          fieldDefinition: null,
        }}
      >
        {children}
      </FieldCtx.Provider>
    </CellCtx.Provider>
  </RowCtx.Provider>
);

const FullSimInner = ({ value }: { value: string }) => {
  const [_isFocused, setIsFocused] = useState(false);
  const [_isOverflowing] = useState(false);
  useContext(RowCtx);
  useContext(CellCtx);
  useContext(FieldCtx);
  useContext(TableCtx);

  const handleMouseMove = () => setIsFocused(true);
  const handleMouseLeave = () => setIsFocused(false);
  const handleClick = () => {};

  return (
    <LinariaOuterWrapper backgroundColor="white" borderColor="#eee">
      <LinariaBaseContainer
        fontColorMedium="#999"
        bgSecondary="#f5f5f5"
        fontColorSecondary="#666"
        isReadOnly={false}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <LinariaDisplayOuter>
          <LinariaDisplayInner>{value}</LinariaDisplayInner>
        </LinariaDisplayOuter>
      </LinariaBaseContainer>
    </LinariaOuterWrapper>
  );
};

const Cell15_FullSimulation = ({
  value,
  row,
  col,
}: {
  value: string;
  row: number;
  col: number;
}) => (
  <FullSimProvider row={row} col={col}>
    <FullSimInner value={value} />
  </FullSimProvider>
);

const FullSimAtomInner = ({
  value,
  recordId,
  fieldName,
  row,
  col,
}: {
  value: string;
  recordId: string;
  fieldName: string;
  row: number;
  col: number;
}) => {
  const [_isFocused, setIsFocused] = useState(false);
  const [_isOverflowing] = useState(false);
  useContext(RowCtx);
  useContext(CellCtx);
  useContext(FieldCtx);
  useContext(TableCtx);
  useAtomValue(recordFieldFamily({ recordId, fieldName }));
  useAtomValue(rowSelectedFamily(recordId));
  useAtomValue(cellIsHoveredFamily({ row, col }));
  useAtomValue(rowFocusedFamily(recordId));
  useAtomValue(rowActiveFamily(recordId));
  useAtomValue(rowDraggingFamily(recordId));
  useAtomValue(rowPendingFamily(recordId));
  useAtomValue(cellReadOnlyFamily(`${recordId}-${fieldName}`));
  useAtomValue(cellForbiddenFamily(`${recordId}-${fieldName}`));
  useAtomValue(objectMetadataItemsAtom);

  const handleMouseMove = () => setIsFocused(true);
  const handleMouseLeave = () => setIsFocused(false);
  const handleClick = () => {};

  return (
    <LinariaOuterWrapper backgroundColor="white" borderColor="#eee">
      <LinariaBaseContainer
        fontColorMedium="#999"
        bgSecondary="#f5f5f5"
        fontColorSecondary="#666"
        isReadOnly={false}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <LinariaDisplayOuter>
          <LinariaDisplayInner>{value}</LinariaDisplayInner>
        </LinariaDisplayOuter>
      </LinariaBaseContainer>
    </LinariaOuterWrapper>
  );
};

const Cell16_FullWithAtoms = ({
  value,
  row,
  col,
}: {
  value: string;
  row: number;
  col: number;
}) => (
  <FullSimProvider row={row} col={col}>
    <FullSimAtomInner
      value={value}
      recordId={`rec-${row}`}
      fieldName={`field-${col}`}
      row={row}
      col={col}
    />
  </FullSimProvider>
);

const W1 = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const W2 = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const W3 = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const W4 = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const W5 = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const W6 = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const W7 = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const W8 = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const W9 = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const W10 = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const W11 = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const W12 = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const W13 = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const W14 = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const Cell17_14Wrappers = ({ value }: { value: string }) => (
  <W1><W2><W3><W4><W5><W6><W7><W8><W9><W10><W11><W12><W13><W14>
    <div style={cellCss}>{value}</div>
  </W14></W13></W12></W11></W10></W9></W8></W7></W6></W5></W4></W3></W2></W1>
);

const MemoizedCell = memo(({ value }: { value: string }) => (
  <LinariaStaticCell>{value}</LinariaStaticCell>
));
MemoizedCell.displayName = 'MemoizedCell';

// ---------------------------------------------------------------------------
// Benchmark harness
// ---------------------------------------------------------------------------

type BenchmarkDef = {
  name: string;
  render: (data: string[][], recordIds: string[]) => React.ReactNode;
};

const BENCHMARKS: BenchmarkDef[] = [
  {
    name: '01. Inline style (baseline)',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell01_InlineStyle key={`${ri}-${ci}`} value={v} />
          )),
        )}
      </div>
    ),
  },
  {
    name: '02. Linaria static',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell02_LinariaStatic key={`${ri}-${ci}`} value={v} />
          )),
        )}
      </div>
    ),
  },
  {
    name: '03. Linaria + 4 dynamic props',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell03_LinariaDynamic key={`${ri}-${ci}`} value={v} />
          )),
        )}
      </div>
    ),
  },
  {
    name: '04. Emotion static',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell04_EmotionStatic key={`${ri}-${ci}`} value={v} />
          )),
        )}
      </div>
    ),
  },
  {
    name: '05. Emotion + 4 dynamic props',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell05_EmotionDynamic key={`${ri}-${ci}`} value={v} />
          )),
        )}
      </div>
    ),
  },
  {
    name: '06. Emotion + theme interpolation',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell06_EmotionTheme key={`${ri}-${ci}`} value={v} />
          )),
        )}
      </div>
    ),
  },
  {
    name: '07. Emotion + withTheme HOC',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell07_EmotionWithTheme key={`${ri}-${ci}`} value={v} />
          )),
        )}
      </div>
    ),
  },
  {
    name: '08. Linaria dynamic + 3 ctx reads',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell08_LinariaPlusContexts key={`${ri}-${ci}`} value={v} />
          )),
        )}
      </div>
    ),
  },
  {
    name: '09. Linaria dynamic + 5 ctx reads',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell09_FiveContexts key={`${ri}-${ci}`} value={v} />
          )),
        )}
      </div>
    ),
  },
  {
    name: '10. + 1 useState per cell',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell10_WithUseState key={`${ri}-${ci}`} value={v} />
          )),
        )}
      </div>
    ),
  },
  {
    name: '11. + 2 useState per cell',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell11_TwoUseStates key={`${ri}-${ci}`} value={v} />
          )),
        )}
      </div>
    ),
  },
  {
    name: '12. + 3 event handlers/cell',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell12_EventHandlers key={`${ri}-${ci}`} value={v} />
          )),
        )}
      </div>
    ),
  },
  {
    name: '13. + 10 Jotai atom reads/cell',
    render: (data, recordIds) => (
      <Provider store={perfStore}>
        <div style={gridCss}>
          {data.flatMap((row, ri) =>
            row.map((v, ci) => (
              <Cell13_JotaiAtoms
                key={`${ri}-${ci}`}
                value={v}
                recordId={recordIds[ri]}
                fieldName={`field-${ci}`}
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
    name: '14. 4-level Linaria nesting',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell14_FourLinariaLevels key={`${ri}-${ci}`} value={v} />
          )),
        )}
      </div>
    ),
  },
  {
    name: '15. Full sim (ctx providers + styled + hooks + handlers)',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell15_FullSimulation
              key={`${ri}-${ci}`}
              value={v}
              row={ri}
              col={ci}
            />
          )),
        )}
      </div>
    ),
  },
  {
    name: '16. Full sim + 10 Jotai atoms (≈real RecordTable)',
    render: (data, recordIds) => (
      <Provider store={perfStore}>
        <div style={gridCss}>
          {data.flatMap((row, ri) =>
            row.map((v, ci) => (
              <Cell16_FullWithAtoms
                key={`${ri}-${ci}`}
                value={v}
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
    name: '17. 14 fragment wrappers per cell',
    render: (data) => (
      <div style={gridCss}>
        {data.flatMap((row, ri) =>
          row.map((v, ci) => (
            <Cell17_14Wrappers key={`${ri}-${ci}`} value={v} />
          )),
        )}
      </div>
    ),
  },
];

type BenchmarkResult = {
  name: string;
  times: number[];
  avg: number;
  min: number;
  max: number;
};

const generateData = () =>
  Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => `Cell ${row}-${col}`),
  );

const generateRecordIds = () =>
  Array.from({ length: ROWS }, (_, i) => `rec-${i}`);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const RecordTableCellPerformanceAudit = () => {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testGrid, setTestGrid] = useState<React.ReactNode | null>(null);
  const [running, setRunning] = useState(false);
  const iterationRef = useRef(0);
  const timesRef = useRef<number[]>([]);
  const startTimeRef = useRef(0);
  const currentBenchRef = useRef<BenchmarkDef | null>(null);
  const queueRef = useRef<BenchmarkDef[]>([]);
  const dataRef = useRef(generateData());
  const recordIdsRef = useRef(generateRecordIds());

  const runSingleIteration = useCallback((bench: BenchmarkDef) => {
    setActiveTest(`${bench.name} (${iterationRef.current + 1}/${ITERATIONS})`);
    startTimeRef.current = performance.now();
    setTestGrid(bench.render(dataRef.current, recordIdsRef.current));
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
          const benchName = currentBenchRef.current?.name ?? 'unknown';
          const times = [...timesRef.current];
          const avg = times.reduce((a, b) => a + b, 0) / times.length;
          const min = Math.min(...times);
          const max = Math.max(...times);

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

  const startBenchmark = useCallback(
    (bench: BenchmarkDef) => {
      currentBenchRef.current = bench;
      iterationRef.current = 0;
      timesRef.current = [];
      runSingleIteration(bench);
    },
    [runSingleIteration],
  );

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
      <h2 style={{ marginBottom: 4 }}>RecordTable Cell Performance Audit</h2>
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
        <div
          style={{
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
            marginTop: 8,
          }}
        >
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
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>
                  Test
                </th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>
                  Avg
                </th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>
                  Min
                </th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>
                  Max
                </th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>
                  Avg/cell
                </th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>
                  vs baseline
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    width: 200,
                  }}
                >
                  Bar
                </th>
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
                    <td
                      style={{
                        padding: '6px 12px',
                        fontWeight: isBaseline ? 600 : 400,
                      }}
                    >
                      {r.name}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        padding: '6px 12px',
                        fontWeight: 600,
                      }}
                    >
                      {r.avg.toFixed(1)}ms
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        padding: '6px 12px',
                        color: '#666',
                      }}
                    >
                      {r.min.toFixed(1)}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        padding: '6px 12px',
                        color: '#666',
                      }}
                    >
                      {r.max.toFixed(1)}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        padding: '6px 12px',
                        color: '#666',
                      }}
                    >
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

      <div
        style={{
          position: 'absolute',
          left: -9999,
          top: -9999,
          visibility: 'hidden',
        }}
      >
        {testGrid}
      </div>
    </div>
  );
};
