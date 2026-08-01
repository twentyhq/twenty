import ms from 'ms';

// Parsed by the same library the consumers call, so the accepted units cannot
// drift from them: IsDuration allows "1M" and "1Month", which ms reads as one
// minute and as nothing at all. Returns undefined for anything ms cannot turn
// into a finite number of milliseconds.
export const parseConfigDuration = (duration: unknown): number | undefined => {
  if (typeof duration !== 'string') {
    return undefined;
  }

  try {
    const parsedDuration = ms(duration as Parameters<typeof ms>[0]);

    return typeof parsedDuration === 'number' && Number.isFinite(parsedDuration)
      ? parsedDuration
      : undefined;
  } catch {
    return undefined;
  }
};
