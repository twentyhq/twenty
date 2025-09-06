export const DEFAULT_DECIMAL_VALUE = 0;

export type FormatNumberOptions = {
  decimals?: number;
  abbreviate?: boolean; // use k, M, B suffixes for large numbers
  locale?: string; // default 'en-US'
};

const defaultOptions: Required<Omit<FormatNumberOptions, 'decimals'>> & {
  decimals: number;
} = {
  decimals: DEFAULT_DECIMAL_VALUE,
  abbreviate: false,
  locale: 'en-US',
};

export const formatNumber = (
  value: number,
  decimalsOrOptions?: number | FormatNumberOptions,
): string => {
  const opts: FormatNumberOptions =
    typeof decimalsOrOptions === 'number'
      ? { decimals: decimalsOrOptions }
      : (decimalsOrOptions ?? {});

  const options = { ...defaultOptions, ...opts };

  if (!Number.isFinite(value)) return String(value);

  if (options.abbreviate) {
    const abs = Math.abs(value);
    let suffix = '';
    let divisor = 1;

    if (abs >= 1e9) {
      suffix = 'B';
      divisor = 1e9;
    } else if (abs >= 1e6) {
      suffix = 'M';
      divisor = 1e6;
    } else if (abs >= 1e3) {
      suffix = 'k';
      divisor = 1e3;
    }

    if (divisor !== 1) {
      const base = value / divisor;
      const formatted = base.toLocaleString(options.locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: options.decimals,
      });
      return formatted + suffix;
    }
  }

  return value.toLocaleString(options.locale, {
    minimumFractionDigits: options.decimals,
    maximumFractionDigits: options.decimals,
  });
};
