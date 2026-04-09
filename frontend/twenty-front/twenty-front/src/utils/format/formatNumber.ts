import { NumberFormat } from '@/localization/constants/NumberFormat';
import { detectNumberFormat } from '@/localization/utils/detection/detectNumberFormat';
import { isDefined } from 'twenty-shared/utils';

export const DEFAULT_DECIMAL_VALUE = 0;

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
      const formatted = base.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: options.decimals,
      });
      return formatted + suffix;
    }
  }

  return value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: options.decimals,
  });
};
