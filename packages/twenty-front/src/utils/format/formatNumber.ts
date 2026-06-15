import { NumberFormat } from '@/localization/constants/NumberFormat';
import { detectNumberFormat } from '@/localization/utils/detection/detectNumberFormat';
import { isDefined } from 'twenty-shared/utils';

export const DEFAULT_DECIMAL_VALUE = 0;

// Indexed by power of 1000: '' (units), 'k', 'M', 'B'
const ABBREVIATION_SUFFIXES = ['', 'k', 'M', 'B'] as const;

const FORMAT_LOCALE_MAP = {
  [NumberFormat.COMMAS_AND_DOT]: 'en-US',
  [NumberFormat.SPACES_AND_COMMA]: 'fr-FR',
  [NumberFormat.DOTS_AND_COMMA]: 'de-DE',
  [NumberFormat.APOSTROPHE_AND_DOT]: 'de-CH',
} as const;

export type FormatNumberOptions = {
  decimals?: number;
  abbreviate?: boolean; // use k, M, B suffixes for large numbers
  locale?: string;
  format?: NumberFormat;
};

const defaultOptions: Required<FormatNumberOptions> = {
  decimals: DEFAULT_DECIMAL_VALUE,
  abbreviate: false,
  locale: FORMAT_LOCALE_MAP[NumberFormat.COMMAS_AND_DOT],
  format: NumberFormat.COMMAS_AND_DOT,
};

const getLocaleForFormat = (format?: NumberFormat): string => {
  if (!format) {
    return defaultOptions.locale;
  }

  if (format === NumberFormat.SYSTEM) {
    const detectedFormat = NumberFormat[detectNumberFormat()];
    return (
      FORMAT_LOCALE_MAP[detectedFormat as keyof typeof FORMAT_LOCALE_MAP] ??
      defaultOptions.locale
    );
  }

  return (
    FORMAT_LOCALE_MAP[format as keyof typeof FORMAT_LOCALE_MAP] ??
    defaultOptions.locale
  );
};

export const formatNumber = (
  value: number,
  opts?: FormatNumberOptions,
): string => {
  if (!Number.isFinite(value)) return String(value);

  const options: Required<FormatNumberOptions> = {
    ...defaultOptions,
    ...(isDefined(opts) ? opts : {}),
  };

  const locale = getLocaleForFormat(options.format);

  if (options.abbreviate) {
    const abs = Math.abs(value);
    let suffixIndex = 0;

    if (abs >= 1e9) {
      suffixIndex = 3;
    } else if (abs >= 1e6) {
      suffixIndex = 2;
    } else if (abs >= 1e3) {
      suffixIndex = 1;
    }

    // The suffix is chosen from the raw value but the displayed base is rounded,
    // so a value just below a power of 1000 can round up into the next unit.
    // Promote while the rounded display value reaches 1000 (e.g. 999_999 rounds
    // to "1,000k", which should read "1M").
    const getRoundedBase = (index: number): number =>
      Math.abs(Number((value / 1000 ** index).toFixed(options.decimals)));

    while (
      suffixIndex < ABBREVIATION_SUFFIXES.length - 1 &&
      getRoundedBase(suffixIndex) >= 1000
    ) {
      suffixIndex += 1;
    }

    if (suffixIndex > 0) {
      const base = value / 1000 ** suffixIndex;
      const formatted = base.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: options.decimals,
      });
      return formatted + ABBREVIATION_SUFFIXES[suffixIndex];
    }
  }

  return value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: options.decimals,
  });
};
