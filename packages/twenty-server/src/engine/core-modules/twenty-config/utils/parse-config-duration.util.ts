import ms from 'ms';

// Same library as the consumers so units cannot drift: ms reads "1M" as a minute and "1Month" as nothing.
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
