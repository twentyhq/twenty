import { stripSeparators } from 'src/utils/strip-separators';

const SIZE_LOOKUP: Record<string, string> = {
  '1-10': 'ONE_TO_TEN',
  '11-50': 'ELEVEN_TO_FIFTY',
  '51-200': 'FIFTY_ONE_TO_TWO_HUNDRED',
  '201-500': 'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED',
  '501-1000': 'FIVE_HUNDRED_ONE_TO_ONE_THOUSAND',
  '1001-5000': 'ONE_THOUSAND_ONE_TO_FIVE_THOUSAND',
  '5001-10000': 'FIVE_THOUSAND_ONE_TO_TEN_THOUSAND',
  '10001+': 'TEN_THOUSAND_ONE_PLUS',
};

export const sizeTransform = (raw: string): string | undefined =>
  SIZE_LOOKUP[stripSeparators(raw)];
