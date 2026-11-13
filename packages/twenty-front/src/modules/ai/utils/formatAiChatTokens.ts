import { formatNumber } from '@/localization/utils/formatNumber';

export const formatInboxTokens = (tokens: number) =>
  formatNumber(tokens, { abbreviate: true, decimals: 1 });
