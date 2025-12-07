const getNiceStep = (roughStep: number): number => {
  if (roughStep === 0) {
    return 0;
  }

  const power = Math.pow(10, Math.floor(Math.log10(Math.abs(roughStep))));
  const normalized = roughStep / power;

  if (normalized >= 5) return 10 * power;
  if (normalized >= 2) return 5 * power;
  if (normalized >= 1) return 2 * power;
  return 1 * power;
};

export const computeValueTickValues = ({
  minimum,
  maximum,
  tickCount,
}: {
  minimum: number;
  maximum: number;
  tickCount: number;
}): number[] => {
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) {
    return [];
  }

  if (minimum === maximum) {
    return [minimum];
  }

  const safeTickCount = Math.max(2, tickCount);
  const roughStep = (maximum - minimum) / (safeTickCount - 1);
  const step = getNiceStep(roughStep);

  if (step === 0) {
    return [minimum, maximum];
  }

  const niceMinimum = Math.floor(minimum / step) * step;
  const niceMaximum = Math.ceil(maximum / step) * step;
  const tickValues: number[] = [];

  for (let value = niceMinimum; value <= niceMaximum + step / 2; value += step) {
    tickValues.push(Number(value.toFixed(12)));
  }

  return tickValues;
};
