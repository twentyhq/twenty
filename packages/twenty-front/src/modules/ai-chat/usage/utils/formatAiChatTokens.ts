import { formatNumber } from '@/localization/utils/formatNumber';

export const formatAiChatTokens = (tokens: number) =>
  formatNumber(tokens, { abbreviate: true, decimals: 1 });
