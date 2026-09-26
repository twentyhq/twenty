export type AiChatUsage = {
  limitValue: number;
  consumedValue: number | null;
  periodEnd: string | null;
  isUsageLimit: boolean;
};
