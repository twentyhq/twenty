const computeNiceStepInterval = (roughStepInterval: number): number => {
  if (roughStepInterval === 0) {
    return 0;
  }

  const stepMagnitude = Math.pow(
    10,
    Math.floor(Math.log10(Math.abs(roughStepInterval))),
  );
  const normalizedStepValue = roughStepInterval / stepMagnitude;

  if (normalizedStepValue >= 5) return 10 * stepMagnitude;
  if (normalizedStepValue >= 2) return 5 * stepMagnitude;
  if (normalizedStepValue >= 1) return 2 * stepMagnitude;
  return 1 * stepMagnitude;
};

export const computeValueTickValues = ({
  minimum,
  maximum,
  tickCount,
}: {
  minimum: number;
  maximum: number;
  tickCount: number;
}): {
  tickValues: number[];
  domain: { min: number; max: number };
} => {
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) {
    return { tickValues: [], domain: { min: 0, max: 0 } };
  }

  if (minimum === maximum) {
    return { tickValues: [minimum], domain: { min: minimum, max: minimum } };
  }

  const safeTickCount = Math.max(2, tickCount);
  const roughStepInterval = (maximum - minimum) / (safeTickCount - 1);
  const niceStepInterval = computeNiceStepInterval(roughStepInterval);

  if (niceStepInterval === 0) {
    return {
      tickValues: [minimum, maximum],
      domain: { min: minimum, max: maximum },
    };
  }

  const niceMinimum = Math.floor(minimum / niceStepInterval) * niceStepInterval;
  const niceMaximum = Math.ceil(maximum / niceStepInterval) * niceStepInterval;
  const tickValues: number[] = [];

  for (
    let tickValue = niceMinimum;
    tickValue <= niceMaximum + niceStepInterval / 2;
    tickValue += niceStepInterval
  ) {
    tickValues.push(Number(tickValue.toFixed(12)));
  }

  return {
    tickValues,
    domain: { min: niceMinimum, max: niceMaximum },
  };
};
