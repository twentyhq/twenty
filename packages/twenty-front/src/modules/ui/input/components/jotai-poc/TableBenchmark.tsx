import styled from '@emotion/styled';
import {
    atom as jotaiAtom,
    Provider as JotaiProvider,
    useAtomValue,
    useSetAtom,
    type WritableAtom,
} from 'jotai';
import { createContext, memo, useCallback, useContext, useState } from 'react';
import { flushSync } from 'react-dom';
import {
    atom as recoilAtom,
    RecoilRoot,
    useRecoilValue,
    useSetRecoilState,
    type RecoilState,
} from 'recoil';

const ROW_COUNT = 50;
const COL_COUNT = 20;
const CELL_COUNT = ROW_COUNT * COL_COUNT;
const UPDATE_CYCLES = 100;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: monospace;
  font-size: 12px;
  gap: 16px;
  max-width: 900px;
  padding: 20px;
`;

const StyledHeader = styled.h2`
  font-size: 16px;
  margin: 0;
`;

const StyledResultsRow = styled.div`
  display: flex;
  gap: 12px;
`;

const StyledSection = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
`;

const StyledLabel = styled.div`
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledSeparator = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  margin: 2px 0;
`;

const StyledButton = styled.button`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  font-family: monospace;
  font-size: 12px;
  padding: 8px 16px;
  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledHighlight = styled.span<{ faster?: boolean }>`
  color: ${({ faster, theme }) =>
    faster === true ? theme.color.green : theme.font.color.primary};
  font-weight: bold;
`;

const StyledNote = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: 11px;
  font-style: italic;
  line-height: 1.4;
`;

type TableBenchmarkResult = {
  singleCellMs: number;
  singleCellPerCycleUs: number;
  singleCellRerenders: number;
  allCellsMs: number;
  allCellsPerCycleUs: number;
  allCellsRerenders: number;
};

// Shared render counter — children increment this on render

const renderCountRef = { current: 0 };

// --- JOTAI TABLE ---

type JotaiStringAtom = WritableAtom<
  string,
  [string | ((prev: string) => string)],
  void
>;

const jotaiCellAtoms: JotaiStringAtom[] = Array.from(
  { length: CELL_COUNT },
  (_, index) => {
    const cellAtom = jotaiAtom(`cell-${index}`);
    cellAtom.debugLabel = `jotai-table-cell-${index}`;
    return cellAtom;
  },
);

const JotaiCell = memo(({ atom: cellAtom }: { atom: JotaiStringAtom }) => {
  const value = useAtomValue(cellAtom);
  renderCountRef.current += 1;
  return <td>{value}</td>;
});

const JotaiTableHarness = ({
  onResult,
}: {
  onResult: (result: TableBenchmarkResult) => void;
}) => {
  const setters = jotaiCellAtoms.map((cellAtom) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSetAtom(cellAtom),
  );

  const runBenchmark = useCallback(() => {
    // Single cell update — only cell 0 should re-render
    renderCountRef.current = 0;
    const singleStart = performance.now();
    for (let cycle = 0; cycle < UPDATE_CYCLES; cycle++) {
      flushSync(() => {
        setters[0](`single-${cycle}`);
      });
    }
    const singleMs = performance.now() - singleStart;
    const singleRerenders = renderCountRef.current;

    // All cells update — every cell re-renders
    renderCountRef.current = 0;
    const allStart = performance.now();
    for (let cycle = 0; cycle < UPDATE_CYCLES; cycle++) {
      flushSync(() => {
        for (let cellIndex = 0; cellIndex < setters.length; cellIndex++) {
          setters[cellIndex](`all-${cycle}-${cellIndex}`);
        }
      });
    }
    const allMs = performance.now() - allStart;
    const allRerenders = renderCountRef.current;

    onResult({
      singleCellMs: Math.round(singleMs * 100) / 100,
      singleCellPerCycleUs: Math.round((singleMs / UPDATE_CYCLES) * 1000),
      singleCellRerenders: singleRerenders,
      allCellsMs: Math.round(allMs * 100) / 100,
      allCellsPerCycleUs: Math.round((allMs / UPDATE_CYCLES) * 1000),
      allCellsRerenders: allRerenders,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onResult, ...setters]);

  return (
    <>
      <StyledButton onClick={runBenchmark}>
        {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
        {'Run Jotai Table'}
      </StyledButton>
      <table style={{ display: 'none' }}>
        <tbody>
          {Array.from({ length: ROW_COUNT }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: COL_COUNT }, (_, colIndex) => (
                <JotaiCell
                  key={colIndex}
                  atom={jotaiCellAtoms[rowIndex * COL_COUNT + colIndex]}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

// --- RECOIL TABLE ---

const recoilCellAtoms: RecoilState<string>[] = Array.from(
  { length: CELL_COUNT },
  (_, index) =>
    recoilAtom<string>({
      key: `recoil-table-cell-${index}`,
      default: `cell-${index}`,
    }),
);

const RecoilCell = memo(
  ({ valueState }: { valueState: RecoilState<string> }) => {
    const value = useRecoilValue(valueState);
    renderCountRef.current += 1;
    return <td>{value}</td>;
  },
);

const RecoilTableHarness = ({
  onResult,
}: {
  onResult: (result: TableBenchmarkResult) => void;
}) => {
  const setters = recoilCellAtoms.map((cellAtom) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSetRecoilState(cellAtom),
  );

  const runBenchmark = useCallback(() => {
    renderCountRef.current = 0;
    const singleStart = performance.now();
    for (let cycle = 0; cycle < UPDATE_CYCLES; cycle++) {
      flushSync(() => {
        setters[0](`single-${cycle}`);
      });
    }
    const singleMs = performance.now() - singleStart;
    const singleRerenders = renderCountRef.current;

    renderCountRef.current = 0;
    const allStart = performance.now();
    for (let cycle = 0; cycle < UPDATE_CYCLES; cycle++) {
      flushSync(() => {
        for (let cellIndex = 0; cellIndex < setters.length; cellIndex++) {
          setters[cellIndex](`all-${cycle}-${cellIndex}`);
        }
      });
    }
    const allMs = performance.now() - allStart;
    const allRerenders = renderCountRef.current;

    onResult({
      singleCellMs: Math.round(singleMs * 100) / 100,
      singleCellPerCycleUs: Math.round((singleMs / UPDATE_CYCLES) * 1000),
      singleCellRerenders: singleRerenders,
      allCellsMs: Math.round(allMs * 100) / 100,
      allCellsPerCycleUs: Math.round((allMs / UPDATE_CYCLES) * 1000),
      allCellsRerenders: allRerenders,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onResult, ...setters]);

  return (
    <>
      <StyledButton onClick={runBenchmark}>
        {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
        {'Run Recoil Table'}
      </StyledButton>
      <table style={{ display: 'none' }}>
        <tbody>
          {Array.from({ length: ROW_COUNT }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: COL_COUNT }, (_, colIndex) => (
                <RecoilCell
                  key={colIndex}
                  valueState={recoilCellAtoms[rowIndex * COL_COUNT + colIndex]}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

// --- CONTEXT TABLE (baseline) ---

const ContextTableContext = createContext<{
  values: string[];
  setValues: React.Dispatch<React.SetStateAction<string[]>>;
} | null>(null);

const ContextCell = memo(({ index }: { index: number }) => {
  const store = useContext(ContextTableContext);
  const value = store?.values[index] ?? '';
  renderCountRef.current += 1;
  return <td>{value}</td>;
});

const ContextTableHarness = ({
  onResult,
}: {
  onResult: (result: TableBenchmarkResult) => void;
}) => {
  const store = useContext(ContextTableContext);

  const runBenchmark = useCallback(() => {
    if (store === null) {
      return;
    }

    renderCountRef.current = 0;
    const singleStart = performance.now();
    for (let cycle = 0; cycle < UPDATE_CYCLES; cycle++) {
      flushSync(() => {
        store.setValues((prev) => {
          const next = [...prev];
          next[0] = `single-${cycle}`;
          return next;
        });
      });
    }
    const singleMs = performance.now() - singleStart;
    const singleRerenders = renderCountRef.current;

    renderCountRef.current = 0;
    const allStart = performance.now();
    for (let cycle = 0; cycle < UPDATE_CYCLES; cycle++) {
      flushSync(() => {
        store.setValues((prev) =>
          prev.map((_, cellIndex) => `all-${cycle}-${cellIndex}`),
        );
      });
    }
    const allMs = performance.now() - allStart;
    const allRerenders = renderCountRef.current;

    onResult({
      singleCellMs: Math.round(singleMs * 100) / 100,
      singleCellPerCycleUs: Math.round((singleMs / UPDATE_CYCLES) * 1000),
      singleCellRerenders: singleRerenders,
      allCellsMs: Math.round(allMs * 100) / 100,
      allCellsPerCycleUs: Math.round((allMs / UPDATE_CYCLES) * 1000),
      allCellsRerenders: allRerenders,
    });
  }, [store, onResult]);

  return (
    <>
      <StyledButton onClick={runBenchmark}>
        {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
        {'Run Context Table'}
      </StyledButton>
      <table style={{ display: 'none' }}>
        <tbody>
          {Array.from({ length: ROW_COUNT }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: COL_COUNT }, (_, colIndex) => (
                <ContextCell
                  key={colIndex}
                  index={rowIndex * COL_COUNT + colIndex}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const ContextTableProvider = ({ children }: { children: React.ReactNode }) => {
  const [values, setValues] = useState<string[]>(
    Array.from({ length: CELL_COUNT }, (_, index) => `cell-${index}`),
  );
  return (
    <ContextTableContext.Provider value={{ values, setValues }}>
      {children}
    </ContextTableContext.Provider>
  );
};

// --- RESULTS DISPLAY ---

const ResultDisplay = ({
  label,
  result,
  comparisons,
}: {
  label: string;
  result: TableBenchmarkResult | null;
  comparisons: (TableBenchmarkResult | null)[];
}) => {
  if (result === null) {
    return (
      <StyledSection>
        <StyledLabel>{label}</StyledLabel>
        {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
        <div>{'Click above to run'}</div>
      </StyledSection>
    );
  }

  const otherResults = comparisons.filter(
    (comparison): comparison is TableBenchmarkResult => comparison !== null,
  );
  const singleFastest =
    otherResults.length > 0 &&
    otherResults.every(
      (comparison) =>
        result.singleCellPerCycleUs <= comparison.singleCellPerCycleUs,
    );
  const allFastest =
    otherResults.length > 0 &&
    otherResults.every(
      (comparison) =>
        result.allCellsPerCycleUs <= comparison.allCellsPerCycleUs,
    );

  return (
    <StyledSection>
      <StyledLabel>{label}</StyledLabel>
      {/* eslint-disable lingui/no-unlocalized-strings */}
      <div>{'Update 1 cell:'}</div>
      <StyledRow>
        <span>{'Time:'}</span>
        <StyledHighlight faster={singleFastest}>
          {`${result.singleCellPerCycleUs}µs/cycle`}
        </StyledHighlight>
      </StyledRow>
      <StyledRow>
        <span>{'Re-renders:'}</span>
        <StyledHighlight
          faster={
            otherResults.length > 0 &&
            otherResults.every(
              (comparison) =>
                result.singleCellRerenders <= comparison.singleCellRerenders,
            )
          }
        >
          {`${result.singleCellRerenders}`}
        </StyledHighlight>
      </StyledRow>
      <StyledSeparator />
      <div>{`Update all ${CELL_COUNT} cells:`}</div>
      <StyledRow>
        <span>{'Time:'}</span>
        <StyledHighlight faster={allFastest}>
          {`${result.allCellsPerCycleUs}µs/cycle`}
        </StyledHighlight>
      </StyledRow>
      <StyledRow>
        <span>{'Re-renders:'}</span>
        <span>{`${result.allCellsRerenders}`}</span>
      </StyledRow>
      {/* eslint-enable lingui/no-unlocalized-strings */}
    </StyledSection>
  );
};

// --- MAIN ---

export const TableBenchmark = () => {
  const [jotaiResult, setJotaiResult] = useState<TableBenchmarkResult | null>(
    null,
  );
  const [recoilResult, setRecoilResult] = useState<TableBenchmarkResult | null>(
    null,
  );
  const [contextResult, setContextResult] =
    useState<TableBenchmarkResult | null>(null);

  return (
    <StyledContainer>
      {/* eslint-disable lingui/no-unlocalized-strings */}
      <StyledHeader>{'Table Benchmark — 1000 cells (50×20)'}</StyledHeader>
      <StyledNote>
        {`${CELL_COUNT} memo'd cells, ${UPDATE_CYCLES} update cycles with flushSync. `}
        {'Measures: time per update cycle + number of component re-renders. '}
        {'The key metric is re-renders on single-cell update.'}
      </StyledNote>
      {/* eslint-enable lingui/no-unlocalized-strings */}

      <div style={{ display: 'flex', gap: 8 }}>
        <JotaiProvider>
          <JotaiTableHarness onResult={setJotaiResult} />
        </JotaiProvider>
        <RecoilRoot>
          <RecoilTableHarness onResult={setRecoilResult} />
        </RecoilRoot>
        <ContextTableProvider>
          <ContextTableHarness onResult={setContextResult} />
        </ContextTableProvider>
      </div>

      <StyledResultsRow>
        <ResultDisplay
          label="Jotai"
          result={jotaiResult}
          comparisons={[recoilResult, contextResult]}
        />
        <ResultDisplay
          label="Recoil"
          result={recoilResult}
          comparisons={[jotaiResult, contextResult]}
        />
        <ResultDisplay
          label="React Context"
          result={contextResult}
          comparisons={[jotaiResult, recoilResult]}
        />
      </StyledResultsRow>

      <StyledNote>
        {/* eslint-disable lingui/no-unlocalized-strings */}
        {'When updating 1 cell: Jotai/Recoil re-render only that cell. '}
        {"Context re-renders ALL 1000 cells (memo can't help because "}
        {'the context value reference changes). This is the real cost '}
        {'difference for large tables.'}
        {/* eslint-enable lingui/no-unlocalized-strings */}
      </StyledNote>
    </StyledContainer>
  );
};
