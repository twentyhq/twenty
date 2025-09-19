import { NumberFormat } from '@/localization/constants/NumberFormat';
import { detectNumberFormat } from '@/localization/utils/detectNumberFormat';

const DEFAULT_DECIMALS = 0;

export const DEFAULT_DECIMAL_VALUE = DEFAULT_DECIMALS;
const DEFAULT_LOCALE = 'en-US';

const FORMAT_LOCALE_MAP = {
  [NumberFormat.COMMAS_AND_DOT]: 'en-US',
  [NumberFormat.SPACES_AND_COMMA]: 'fr-FR',
  [NumberFormat.DOTS_AND_COMMA]: 'de-DE',
  [NumberFormat.APOSTROPHE_AND_DOT]: 'de-CH',
} as const;

const getLocaleForFormat = (format?: NumberFormat): string => {
  if (!format) {
    return DEFAULT_LOCALE;
  }

  if (format === NumberFormat.SYSTEM) {
    const detectedFormat = NumberFormat[detectNumberFormat()];
    return (
      FORMAT_LOCALE_MAP[detectedFormat as keyof typeof FORMAT_LOCALE_MAP] ??
      DEFAULT_LOCALE
    );
  }

  return (
    FORMAT_LOCALE_MAP[format as keyof typeof FORMAT_LOCALE_MAP] ??
    DEFAULT_LOCALE
  );
};

export const formatNumber = (
  value: number,
  decimalsOrFormat?: number | NumberFormat,
  decimals?: number,
): string => {
  // Parse parameters
  const isLegacyCall = typeof decimalsOrFormat === 'number';
  const actualDecimals = isLegacyCall
    ? decimalsOrFormat
    : (decimals ?? DEFAULT_DECIMALS);
  const format = isLegacyCall ? undefined : decimalsOrFormat;

  // Create formatting options
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: actualDecimals,
    maximumFractionDigits: actualDecimals,
  };

  // Determine locale
  const locale = getLocaleForFormat(format);

  return new Intl.NumberFormat(locale, options).format(value);
};
