import { formatNumber } from '~/utils/format/formatNumber';

export const formatAiChatTokens = (tokens: number) =>
  formatNumber(tokens, { abbreviate: true, decimals: 1 });
