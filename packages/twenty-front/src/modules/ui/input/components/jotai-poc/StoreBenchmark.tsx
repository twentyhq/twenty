import styled from '@emotion/styled';
import { createStore, atom as jotaiAtom } from 'jotai';
import { useCallback, useState } from 'react';
import { atom as recoilAtom, snapshot_UNSTABLE } from 'recoil';

const ATOM_COUNT = 100;
const READ_ITERATIONS = 100_000;
const WRITE_ITERATIONS = 50_000;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: monospace;
  font-size: 13px;
  gap: 16px;
  max-width: 800px;
  padding: 20px;
`;

const StyledHeader = styled.h2`
  font-size: 16px;
  margin: 0;
`;

const StyledSection = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
`;

const StyledLabel = styled.div`
  font-size: 14px;
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
  margin: 4px 0;
`;

const StyledButton = styled.button`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  font-family: monospace;
  font-size: 13px;
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

type BenchmarkResult = {
  readTotalMs: number;
  readPerOpNs: number;
  writeTotalMs: number;
  writePerOpNs: number;
  writeReadBackTotalMs: number;
  writeReadBackPerOpNs: number;
  atomCount: number;
  readIterations: number;
  writeIterations: number;
};

// Jotai: direct store access, fully synchronous
const runJotaiBenchmark = (): BenchmarkResult => {
  const store = createStore();
  const atoms = Array.from({ length: ATOM_COUNT }, (_, index) => {
    const atomInstance = jotaiAtom(`value-${index}`);
    atomInstance.debugLabel = `bench-jotai-${index}`;
    return atomInstance;
  });

  // Warm up
  for (const atomInstance of atoms) {
    store.get(atomInstance);
  }

  // Benchmark reads
  const readStart = performance.now();
  for (let iteration = 0; iteration < READ_ITERATIONS; iteration++) {
    for (const atomInstance of atoms) {
      store.get(atomInstance);
    }
  }
  const readTotalMs = performance.now() - readStart;
  const totalReads = READ_ITERATIONS * ATOM_COUNT;

  // Benchmark writes (synchronous — updates store immediately)
  const writeStart = performance.now();
  for (let iteration = 0; iteration < WRITE_ITERATIONS; iteration++) {
    for (const atomInstance of atoms) {
      store.set(atomInstance, `updated-${iteration}`);
    }
  }
  const writeTotalMs = performance.now() - writeStart;
  const totalWrites = WRITE_ITERATIONS * ATOM_COUNT;

  // Benchmark write + read-back (proves write was committed)
  const wrbStart = performance.now();
  for (let iteration = 0; iteration < WRITE_ITERATIONS; iteration++) {
    for (const atomInstance of atoms) {
      store.set(atomInstance, `wrb-${iteration}`);
      store.get(atomInstance);
    }
  }
  const wrbTotalMs = performance.now() - wrbStart;

  return {
    readTotalMs: Math.round(readTotalMs * 100) / 100,
    readPerOpNs: Math.round((readTotalMs / totalReads) * 1_000_000),
    writeTotalMs: Math.round(writeTotalMs * 100) / 100,
    writePerOpNs: Math.round((writeTotalMs / totalWrites) * 1_000_000),
    writeReadBackTotalMs: Math.round(wrbTotalMs * 100) / 100,
    writeReadBackPerOpNs: Math.round((wrbTotalMs / totalWrites) * 1_000_000),
    atomCount: ATOM_COUNT,
    readIterations: READ_ITERATIONS,
    writeIterations: WRITE_ITERATIONS,
  };
};

// Recoil: uses snapshot_UNSTABLE for fair synchronous comparison
const runRecoilBenchmark = (): BenchmarkResult => {
  const atoms = Array.from({ length: ATOM_COUNT }, (_, index) =>
    recoilAtom<string>({
      key: `bench-recoil-${index}-${Date.now()}`,
      default: `value-${index}`,
    }),
  );

  const baseSnapshot = snapshot_UNSTABLE();

  // Warm up
  for (const atomInstance of atoms) {
    baseSnapshot.getLoadable(atomInstance).getValue();
  }

  // Benchmark reads (from snapshot — same as useRecoilCallback snapshot)
  const readStart = performance.now();
  for (let iteration = 0; iteration < READ_ITERATIONS; iteration++) {
    for (const atomInstance of atoms) {
      baseSnapshot.getLoadable(atomInstance).getValue();
    }
  }
  const readTotalMs = performance.now() - readStart;
  const totalReads = READ_ITERATIONS * ATOM_COUNT;

  // Benchmark writes using snapshot.map (synchronous — creates new snapshot)
  const writeStart = performance.now();
  let currentSnapshot = baseSnapshot;
  for (let iteration = 0; iteration < WRITE_ITERATIONS; iteration++) {
    currentSnapshot = currentSnapshot.map(({ set }) => {
      for (const atomInstance of atoms) {
        set(atomInstance, `updated-${iteration}`);
      }
    });
  }
  const writeTotalMs = performance.now() - writeStart;
  const totalWrites = WRITE_ITERATIONS * ATOM_COUNT;

  // Benchmark write + read-back
  const wrbStart = performance.now();
  let wrbSnapshot = baseSnapshot;
  for (let iteration = 0; iteration < WRITE_ITERATIONS; iteration++) {
    wrbSnapshot = wrbSnapshot.map(({ set }) => {
      for (const atomInstance of atoms) {
        set(atomInstance, `wrb-${iteration}`);
      }
    });
    for (const atomInstance of atoms) {
      wrbSnapshot.getLoadable(atomInstance).getValue();
    }
  }
  const wrbTotalMs = performance.now() - wrbStart;

  // Clean up snapshots
  baseSnapshot.retain();
  currentSnapshot.retain();
  wrbSnapshot.retain();

  return {
    readTotalMs: Math.round(readTotalMs * 100) / 100,
    readPerOpNs: Math.round((readTotalMs / totalReads) * 1_000_000),
    writeTotalMs: Math.round(writeTotalMs * 100) / 100,
    writePerOpNs: Math.round((writeTotalMs / totalWrites) * 1_000_000),
    writeReadBackTotalMs: Math.round(wrbTotalMs * 100) / 100,
    writeReadBackPerOpNs: Math.round((wrbTotalMs / totalWrites) * 1_000_000),
    atomCount: ATOM_COUNT,
    readIterations: READ_ITERATIONS,
    writeIterations: WRITE_ITERATIONS,
  };
};

const ResultDisplay = ({
  label,
  result,
  comparison,
}: {
  label: string;
  result: BenchmarkResult | null;
  comparison?: BenchmarkResult | null;
}) => {
  if (result === null) {
    return (
      <StyledSection>
        <StyledLabel>{label}</StyledLabel>
        {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
        <div>{'Click button above to run'}</div>
      </StyledSection>
    );
  }

  const hasComparison = comparison !== null && comparison !== undefined;
  const readFaster =
    hasComparison && result.readPerOpNs < comparison.readPerOpNs;
  const writeFaster =
    hasComparison && result.writePerOpNs < comparison.writePerOpNs;
  const wrbFaster =
    hasComparison &&
    result.writeReadBackPerOpNs < comparison.writeReadBackPerOpNs;

  return (
    <StyledSection>
      <StyledLabel>{label}</StyledLabel>
      {/* eslint-disable lingui/no-unlocalized-strings */}
      <StyledRow>
        <span>{'Read total:'}</span>
        <span>{`${result.readTotalMs}ms`}</span>
      </StyledRow>
      <StyledRow>
        <span>{'Read per op:'}</span>
        <StyledHighlight faster={readFaster}>
          {`${result.readPerOpNs}ns`}
        </StyledHighlight>
      </StyledRow>
      <StyledSeparator />
      <StyledRow>
        <span>{'Write total:'}</span>
        <span>{`${result.writeTotalMs}ms`}</span>
      </StyledRow>
      <StyledRow>
        <span>{'Write per op:'}</span>
        <StyledHighlight faster={writeFaster}>
          {`${result.writePerOpNs}ns`}
        </StyledHighlight>
      </StyledRow>
      <StyledSeparator />
      <StyledRow>
        <span>{'Write+Read total:'}</span>
        <span>{`${result.writeReadBackTotalMs}ms`}</span>
      </StyledRow>
      <StyledRow>
        <span>{'Write+Read per op:'}</span>
        <StyledHighlight faster={wrbFaster}>
          {`${result.writeReadBackPerOpNs}ns`}
        </StyledHighlight>
      </StyledRow>
      {/* eslint-enable lingui/no-unlocalized-strings */}
    </StyledSection>
  );
};

export const StoreBenchmark = () => {
  const [jotaiResult, setJotaiResult] = useState<BenchmarkResult | null>(null);
  const [recoilResult, setRecoilResult] = useState<BenchmarkResult | null>(
    null,
  );
  const [isRunning, setIsRunning] = useState(false);

  const handleRunJotai = useCallback(() => {
    setIsRunning(true);
    requestAnimationFrame(() => {
      const result = runJotaiBenchmark();
      setJotaiResult(result);
      setIsRunning(false);
    });
  }, []);

  const handleRunRecoil = useCallback(() => {
    setIsRunning(true);
    requestAnimationFrame(() => {
      const result = runRecoilBenchmark();
      setRecoilResult(result);
      setIsRunning(false);
    });
  }, []);

  return (
    <StyledContainer>
      {/* eslint-disable lingui/no-unlocalized-strings */}
      <StyledHeader>{'Jotai vs Recoil — Raw Store Benchmark'}</StyledHeader>
      <StyledNote>
        {`${ATOM_COUNT} atoms × ${READ_ITERATIONS.toLocaleString()} read iters, ${WRITE_ITERATIONS.toLocaleString()} write iters. `}
        {'Both use synchronous store APIs (no React rendering). '}
        {'Jotai: store.get/set. Recoil: snapshot.getLoadable / snapshot.map.'}
      </StyledNote>
      {/* eslint-enable lingui/no-unlocalized-strings */}

      <div style={{ display: 'flex', gap: 8 }}>
        <StyledButton onClick={handleRunJotai} disabled={isRunning}>
          {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
          {isRunning ? 'Running...' : 'Run Jotai'}
        </StyledButton>
        <StyledButton onClick={handleRunRecoil} disabled={isRunning}>
          {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
          {isRunning ? 'Running...' : 'Run Recoil'}
        </StyledButton>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <ResultDisplay
          label="Jotai"
          result={jotaiResult}
          comparison={recoilResult}
        />
        <ResultDisplay
          label="Recoil"
          result={recoilResult}
          comparison={jotaiResult}
        />
      </div>

      <StyledNote>
        {/* eslint-disable lingui/no-unlocalized-strings */}
        {'Write+Read measures a full round-trip: write a value then '}
        {'immediately read it back, proving the write was committed. '}
        {'This is the fairest comparison since both libraries use '}
        {'different write strategies (Jotai=sync, Recoil=snapshot copy).'}
        {/* eslint-enable lingui/no-unlocalized-strings */}
      </StyledNote>
    </StyledContainer>
  );
};
