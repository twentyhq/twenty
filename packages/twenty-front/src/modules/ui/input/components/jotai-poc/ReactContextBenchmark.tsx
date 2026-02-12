import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

const SLOT_COUNT = 100;
const READ_ITERATIONS = 100_000;
const WRITE_ITERATIONS = 50_000;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: monospace;
  font-size: 13px;
  gap: 16px;
  max-width: 500px;
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
};

// Plain object store — simulates what a React Context would hold
// Measures the raw JS cost of reading/writing a Map (the data structure
// behind any context-based state), without React overhead.
const runContextBenchmark = (): BenchmarkResult => {
  const store = new Map<string, string>();

  // Initialize slots
  for (let index = 0; index < SLOT_COUNT; index++) {
    store.set(`key-${index}`, `value-${index}`);
  }

  const keys = Array.from({ length: SLOT_COUNT }, (_, index) => `key-${index}`);

  // Warm up
  for (const key of keys) {
    store.get(key);
  }

  // Benchmark reads (Map.get — same cost as context value lookup)
  const readStart = performance.now();
  for (let iteration = 0; iteration < READ_ITERATIONS; iteration++) {
    for (const key of keys) {
      store.get(key);
    }
  }
  const readTotalMs = performance.now() - readStart;
  const totalReads = READ_ITERATIONS * SLOT_COUNT;

  // Benchmark writes (Map.set — same cost as context value mutation)
  const writeStart = performance.now();
  for (let iteration = 0; iteration < WRITE_ITERATIONS; iteration++) {
    for (const key of keys) {
      store.set(key, `updated-${iteration}`);
    }
  }
  const writeTotalMs = performance.now() - writeStart;
  const totalWrites = WRITE_ITERATIONS * SLOT_COUNT;

  // Benchmark write + read-back
  const wrbStart = performance.now();
  for (let iteration = 0; iteration < WRITE_ITERATIONS; iteration++) {
    for (const key of keys) {
      store.set(key, `wrb-${iteration}`);
      store.get(key);
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
  };
};

export const ReactContextBenchmark = () => {
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    requestAnimationFrame(() => {
      const benchResult = runContextBenchmark();
      setResult(benchResult);
      setIsRunning(false);
    });
  }, []);

  return (
    <StyledContainer>
      {/* eslint-disable lingui/no-unlocalized-strings */}
      <StyledHeader>{'Plain JS Map Benchmark (baseline)'}</StyledHeader>
      <StyledNote>
        {`${SLOT_COUNT} keys, ${READ_ITERATIONS.toLocaleString()} read iters, ${WRITE_ITERATIONS.toLocaleString()} write iters. `}
        {'Raw Map.get/set — the data structure cost behind any '}
        {'context-based store. No React, no library overhead.'}
      </StyledNote>
      {/* eslint-enable lingui/no-unlocalized-strings */}

      <StyledButton onClick={handleRun} disabled={isRunning}>
        {/* eslint-disable-next-line lingui/no-unlocalized-strings */}
        {isRunning ? 'Running...' : 'Run Baseline'}
      </StyledButton>

      {result !== null && (
        <StyledSection>
          {/* eslint-disable lingui/no-unlocalized-strings */}
          <StyledLabel>{'Plain Map (baseline)'}</StyledLabel>
          <StyledRow>
            <span>{'Read total:'}</span>
            <span>{`${result.readTotalMs}ms`}</span>
          </StyledRow>
          <StyledRow>
            <span>{'Read per op:'}</span>
            <span>{`${result.readPerOpNs}ns`}</span>
          </StyledRow>
          <StyledSeparator />
          <StyledRow>
            <span>{'Write total:'}</span>
            <span>{`${result.writeTotalMs}ms`}</span>
          </StyledRow>
          <StyledRow>
            <span>{'Write per op:'}</span>
            <span>{`${result.writePerOpNs}ns`}</span>
          </StyledRow>
          <StyledSeparator />
          <StyledRow>
            <span>{'Write+Read total:'}</span>
            <span>{`${result.writeReadBackTotalMs}ms`}</span>
          </StyledRow>
          <StyledRow>
            <span>{'Write+Read per op:'}</span>
            <span>{`${result.writeReadBackPerOpNs}ns`}</span>
          </StyledRow>
          {/* eslint-enable lingui/no-unlocalized-strings */}
        </StyledSection>
      )}

      <StyledNote>
        {/* eslint-disable lingui/no-unlocalized-strings */}
        {'Compare these numbers to the Jotai/Recoil store benchmark '}
        {'to see how much overhead each library adds on top of a raw '}
        {'key-value store access.'}
        {/* eslint-enable lingui/no-unlocalized-strings */}
      </StyledNote>
    </StyledContainer>
  );
};
